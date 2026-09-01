import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { PostWithRelations } from "@/lib/types";

export const POST_WITH_RELATIONS_SELECT = `
  *,
  category:categories(*),
  subcategories:post_subcategories(subcategory:subcategories(*)),
  author:profiles(id, full_name, email, public_title, avatar_url, linkedin_url)
`;

// Aplana la respuesta de Supabase (post_subcategories -> subcategory) en
// post.subcategories. `category` ya viene con la forma correcta (FK directa,
// a-uno) y pasa tal cual por el ...rest. `subcategory_filter` es un embed
// auxiliar que algunas queries agregan solo para filtrar; se descarta acá.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePost(raw: any): PostWithRelations {
  const { post_subcategories, subcategory_filter, ...rest } = raw;
  return {
    ...rest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subcategories: (post_subcategories ?? []).map((ps: any) => ps.subcategory).filter(Boolean),
  };
}

export const POSTS_PER_PAGE = 9;

export async function getFeaturedPost(): Promise<PostWithRelations | null> {
  const supabase = await createPublicClient();

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
  const supabase = await createPublicClient();

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

export async function getPopularPosts(
  excludeIds: string[] = [],
  limit = 5
): Promise<PostWithRelations[]> {
  const supabase = await createPublicClient();

  let query = supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT)
    .eq("status", "published")
    .eq("is_popular", true);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(normalizePost);
}

export async function getPublishedPosts(
  page = 1,
  excludeIds: string[] = []
): Promise<{ posts: PostWithRelations[]; count: number }> {
  const supabase = await createPublicClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  let query = supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT, { count: "exact" })
    .eq("status", "published");

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error, count } = await query
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: (data ?? []).map(normalizePost), count: count ?? 0 };
}

export async function getPostBySlug(
  slug: string
): Promise<PostWithRelations | null> {
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();
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

export async function getPublishedPostsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
  page = 1
): Promise<{ posts: PostWithRelations[]; count: number }> {
  const supabase = await createPublicClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(
      `${POST_WITH_RELATIONS_SELECT}, subcategory_filter:post_subcategories!inner(subcategory:subcategories!inner(slug, category:categories!inner(slug)))`,
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("subcategory_filter.subcategory.slug", subcategorySlug)
    .eq("subcategory_filter.subcategory.category.slug", categorySlug)
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
