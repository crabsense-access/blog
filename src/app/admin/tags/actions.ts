"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { tagFormSchema } from "@/lib/validations/post";

export interface TagFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parse(formData: FormData) {
  return tagFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
}

export async function createTag(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/admin/tags");
  return {};
}

export async function updateTag(
  id: string,
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("tags").update(parsed.data).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/tags");
  return {};
}

export async function deleteTag(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/tags");
}
