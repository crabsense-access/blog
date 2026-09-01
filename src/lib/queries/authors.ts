import { createClient, createPublicClient } from "@/lib/supabase/server";
import { POST_WITH_RELATIONS_SELECT, normalizePost, POSTS_PER_PAGE } from "@/lib/queries/posts";
import type { PostWithRelations, Profile } from "@/lib/types";

export async function getFeaturedExperts(): Promise<Profile[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_featured_expert", true)
    .order("featured_position", { ascending: true })
    .limit(5);

  if (error) throw error;
  return data ?? [];
}

export async function getAuthorById(id: string): Promise<Profile | null> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPublishedPostsByAuthor(
  authorId: string,
  page = 1
): Promise<{ posts: PostWithRelations[]; count: number }> {
  const supabase = await createPublicClient();
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(POST_WITH_RELATIONS_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("author_id", authorId)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: (data ?? []).map(normalizePost), count: count ?? 0 };
}

// ---- Admin ----

export async function getAllProfilesForAdmin(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
