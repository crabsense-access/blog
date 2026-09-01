"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { subcategoryFormSchema } from "@/lib/validations/post";

export interface SubcategoryFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parse(formData: FormData) {
  return subcategoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category_id: formData.get("category_id"),
  });
}

export async function createSubcategory(
  _prevState: SubcategoryFormState,
  formData: FormData
): Promise<SubcategoryFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("subcategories").insert(parsed.data);

  if (error) return { error: error.message };

  revalidatePath("/admin/subcategories");
  return {};
}

export async function updateSubcategory(
  id: string,
  _prevState: SubcategoryFormState,
  formData: FormData
): Promise<SubcategoryFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("subcategories")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/subcategories");
  return {};
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/subcategories");
}
