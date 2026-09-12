"use server";

import { getPublishedPostsByCategoryRange } from "@/lib/queries/posts";
import type { PostWithRelations } from "@/lib/types";

export async function loadMoreCategoryPosts(
  categorySlug: string,
  offset: number,
  limit: number
): Promise<PostWithRelations[]> {
  const { posts } = await getPublishedPostsByCategoryRange(categorySlug, offset, limit);
  return posts;
}
