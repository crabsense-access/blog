import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { Category, Subcategory } from "@/lib/types";

export interface SubcategoryWithCategory extends Subcategory {
  category: Category;
}

export async function getSubcategories(): Promise<Subcategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSubcategoriesByCategoryId(
  categoryId: string
): Promise<Subcategory[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSubcategoryWithCategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<SubcategoryWithCategory | null> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*, category:categories!inner(*)")
    .eq("slug", subcategorySlug)
    .eq("category.slug", categorySlug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
