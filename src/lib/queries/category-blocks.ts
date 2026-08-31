import { createClient } from "@/lib/supabase/server";
import { POST_WITH_RELATIONS_SELECT, normalizePost } from "@/lib/queries/posts";
import type { CategoryBlockWithCategory, PostWithRelations } from "@/lib/types";

export async function getCategoryBlocks(): Promise<CategoryBlockWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category_blocks")
    .select("*, category:categories(*)")
    .order("position", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getPostsByCategoryId(
  categoryId: string,
  limit = 20
): Promise<PostWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(normalizePost);
}
