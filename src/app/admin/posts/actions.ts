"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { postFormSchema } from "@/lib/validations/post";

function parseFormData(formData: FormData) {
  const tagIds = formData.getAll("tag_ids").map(String);
  const isFeatured = formData.get("is_featured") === "on";

  return postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    content: formData.get("content"),
    cover_image_url: formData.get("cover_image_url") ?? "",
    status: formData.get("status"),
    category_id: formData.get("category_id") ?? "",
    is_featured: isFeatured,
    tag_ids: tagIds,
  });
}

export interface PostFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { tag_ids, category_id, is_featured, ...values } = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si es_featured es true, poner is_featured=false en todos los demás posts
  if (is_featured) {
    await supabase
      .from("posts")
      .update({ is_featured: false })
      .eq("is_featured", true);
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      ...values,
      category_id: category_id || null,
      author_id: user?.id ?? null,
      is_featured,
      published_at: values.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: error?.message ?? "No se pudo crear la nota." };
  }

  if (tag_ids.length > 0) {
    await supabase
      .from("post_tags")
      .insert(tag_ids.map((tag_id) => ({ post_id: post.id, tag_id })));
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function updatePost(
  id: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { tag_ids, category_id, is_featured, ...values } = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("posts")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();

  const published_at =
    values.status === "published"
      ? (current?.published_at ?? new Date().toISOString())
      : null;

  // Si es_featured es true, poner is_featured=false en todos los demás posts
  if (is_featured) {
    await supabase
      .from("posts")
      .update({ is_featured: false })
      .neq("id", id)
      .eq("is_featured", true);
  }

  const { error } = await supabase
    .from("posts")
    .update({ ...values, category_id: category_id || null, published_at, is_featured })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("post_tags").delete().eq("post_id", id);
  if (tag_ids.length > 0) {
    await supabase
      .from("post_tags")
      .insert(tag_ids.map((tag_id) => ({ post_id: id, tag_id })));
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
}
