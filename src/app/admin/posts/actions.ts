"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { postFormSchema } from "@/lib/validations/post";
import { uploadPublicImage } from "@/lib/storage";

function parseFormData(formData: FormData) {
  const subcategoryIds = formData.getAll("subcategory_ids").map(String);
  const isFeatured = formData.get("is_featured") === "on";
  const isPopular = formData.get("is_popular") === "on";
  const featuredInSlider = formData.get("featured_in_slider") === "on";

  let faqs: unknown = [];
  try {
    faqs = JSON.parse(String(formData.get("faqs") ?? "[]"));
  } catch {
    faqs = [];
  }

  return postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    quick_answer: formData.get("quick_answer") ?? "",
    content: formData.get("content"),
    status: formData.get("status"),
    category_id: formData.get("category_id"),
    author_id: formData.get("author_id") ?? "",
    is_featured: isFeatured,
    is_popular: isPopular,
    featured_in_slider: featuredInSlider,
    subcategory_ids: subcategoryIds,
    meta_title: formData.get("meta_title") ?? "",
    meta_description: formData.get("meta_description") ?? "",
    canonical_url: formData.get("canonical_url") ?? "",
    faqs,
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

  const { subcategory_ids, author_id, is_featured, ...values } = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cover_image_url: string | undefined;
  const coverImageFile = formData.get("cover_image_file");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      cover_image_url = await uploadPublicImage(supabase, "post-covers", coverImageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen de portada: ${(e as Error).message}` };
    }
  }

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
      ...(cover_image_url ? { cover_image_url } : {}),
      author_id: author_id || user?.id || null,
      is_featured,
      published_at: values.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: error?.message ?? "No se pudo crear la nota." };
  }

  if (subcategory_ids.length > 0) {
    await supabase
      .from("post_subcategories")
      .insert(subcategory_ids.map((subcategory_id) => ({ post_id: post.id, subcategory_id })));
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
  revalidatePath("/");
  redirect("/admin/posts?saved=1");
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

  const { subcategory_ids, author_id, is_featured, ...values } = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("posts")
    .select("status, published_at, slug")
    .eq("id", id)
    .maybeSingle();

  const published_at =
    values.status === "published"
      ? (current?.published_at ?? new Date().toISOString())
      : null;

  let cover_image_url: string | undefined;
  const coverImageFile = formData.get("cover_image_file");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      cover_image_url = await uploadPublicImage(supabase, "post-covers", coverImageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen de portada: ${(e as Error).message}` };
    }
  }

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
    .update({
      ...values,
      ...(cover_image_url ? { cover_image_url } : {}),
      author_id: author_id || null,
      published_at,
      is_featured,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("post_subcategories").delete().eq("post_id", id);
  if (subcategory_ids.length > 0) {
    await supabase
      .from("post_subcategories")
      .insert(subcategory_ids.map((subcategory_id) => ({ post_id: id, subcategory_id })));
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
  if (current?.slug && current.slug !== values.slug) {
    revalidatePath(`/blog/${current.slug}`);
  }
  revalidatePath("/");
  // A diferencia de createPost, acá no redirigimos: el pedido es quedarse
  // en la misma página de edición después de guardar (para poder seguir
  // editando sin volver a entrar desde la lista) — el toast de éxito lo
  // dispara post-form.tsx vía useSuccessToast al ver este estado "{}".
  return {};
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  if (existing?.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath("/");
}
