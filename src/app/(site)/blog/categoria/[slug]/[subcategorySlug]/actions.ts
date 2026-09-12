"use server";

import { getPublishedPostsBySubcategoryRange } from "@/lib/queries/posts";
import type { PostWithRelations } from "@/lib/types";

export async function loadMoreSubcategoryPosts(
  categorySlug: string,
  subcategorySlug: string,
  offset: number,
  limit: number
): Promise<PostWithRelations[]> {
  const { posts } = await getPublishedPostsBySubcategoryRange(
    categorySlug,
    subcategorySlug,
    offset,
    limit
  );
  return posts;
}
