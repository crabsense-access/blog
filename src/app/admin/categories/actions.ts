"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { categoryFormSchema } from "@/lib/validations/post";
import { uploadPublicImage } from "@/lib/storage";

export interface CategoryFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parse(formData: FormData) {
  return categoryFormSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    pill_color: formData.get("pill_color") ?? "",
  });
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const insertData: Record<string, unknown> = { ...parsed.data };

  const imageFile = formData.get("image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      insertData.image_url = await uploadPublicImage(supabase, "category-images", imageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase.from("categories").insert(insertData);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  return {};
}

export async function updateCategory(
  id: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const updateData: Record<string, unknown> = { ...parsed.data };

  const imageFile = formData.get("image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      updateData.image_url = await uploadPublicImage(supabase, "category-images", imageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  return {};
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/categories");
}
