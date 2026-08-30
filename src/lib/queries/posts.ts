import { createClient } from "@/lib/supabase/server";
import type { PostWithRelations } from "@/lib/types";

const POST_WITH_RELATIONS_SELECT = `
  *,
  category:categories(*),
  post_tags(tag:tags(*))
`;

// Aplana la respuesta de Supabase (post_tags -> tag) en post.tags.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePost(raw: any): PostWithRelations {
  const { post_tags, ...rest } = raw;
  return {
    ...rest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: (post_tags ?? []).map((pt: any) => pt.tag).filter(Boolean),
  };
}

export const POSTS_PER_PAGE = 9;

export async function getFeaturedPost(): Promise<PostWithRelations | null> {
  const supabase = await createClient();

  // Busca primero el post marcado como destacado
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // Si existe, devolverlo
  if (data) {
    return normalizePost(data);
  }

  // Si no hay destacado, devolver el último publicado
  const { data: fallback, error: fallbackError } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fallbackError) throw fallbackError;
  return fallback ? normalizePost(fallback) : null;
}

export async function getRelatedPublishedPosts(
  excludeId: string,
  limit = 3
): Promise<PostWithRelations[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(normalizePost);
}

export async function getPublishedPosts(
  page = 1
): Promise<{ posts: PostWithRelations[]; count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: (data ?? []).map(normalizePost), count: count ?? 0 };
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizePost(data) : null;
}

export async function getPublishedPostsByCategory(
  categorySlug: string,
  page = 1
): Promise<{ posts: PostWithRelations[]; count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("category.slug", categorySlug)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: (data ?? []).map(normalizePost), count: count ?? 0 };
}

export async function getPublishedPostsByTag(
  tagSlug: string,
  page = 1
): Promise<{ posts: PostWithRelations[]; count: number }> {
  const supabase = await createClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(
      `*, category:categories(*), post_tags!inner(tag:tags!inner(*))`,
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("post_tags.tag.slug", tagSlug)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: (data ?? []).map(normalizePost), count: count ?? 0 };
}

// ---- Admin ----

export async function getAllPostsForAdmin(): Promise<PostWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizePost);
}

export async function getPostByIdForAdmin(
  id: string
): Promise<PostWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizePost(data) : null;
}
