"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { categoryBlockFormSchema } from "@/lib/validations/post";

export interface CategoryBlockFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function updateCategoryBlock(
  position: 1 | 2 | 3,
  _prevState: CategoryBlockFormState,
  formData: FormData
): Promise<CategoryBlockFormState> {
  const parsed = categoryBlockFormSchema.safeParse({
    category_id: formData.get("category_id") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { category_id } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("category_blocks")
    .update({ category_id: category_id || null })
    .eq("position", position);

  if (error) return { error: error.message };

  revalidatePath("/admin/category-blocks");
  revalidatePath("/blog");
  return {};
}
