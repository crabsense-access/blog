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
    description: formData.get("description"),
    category_id: formData.get("category_id"),
    pill_color: formData.get("pill_color") ?? "",
  });
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imageFile: File
) {
  const ext = imageFile.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("category-images")
    .upload(path, imageFile, { upsert: true });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("category-images").getPublicUrl(path);

  return publicUrl;
}

export async function createSubcategory(
  _prevState: SubcategoryFormState,
  formData: FormData
): Promise<SubcategoryFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const insertData: Record<string, unknown> = { ...parsed.data };

  const imageFile = formData.get("image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      insertData.image_url = await uploadImage(supabase, imageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase.from("subcategories").insert(insertData);

  if (error) return { error: error.message };

  revalidatePath("/admin/subcategories");
  revalidatePath("/blog");
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
  const updateData: Record<string, unknown> = { ...parsed.data };

  const imageFile = formData.get("image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      updateData.image_url = await uploadImage(supabase, imageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase
    .from("subcategories")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/subcategories");
  revalidatePath("/blog");
  return {};
}

export async function deleteSubcategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subcategories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/subcategories");
}
