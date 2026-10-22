import { createClient } from "@/lib/supabase/server";
import { normalizeSlide, type LinkedInPost } from "@/lib/linkedin";

function normalizeLinkedInPost(raw: Record<string, unknown>): LinkedInPost {
  const post = raw as unknown as LinkedInPost;
  return {
    ...post,
    hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
    slides: Array.isArray(post.slides) ? post.slides.map((s) => normalizeSlide(s)) : [],
  };
}

export async function getAllLinkedInPostsForAdmin(): Promise<LinkedInPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("linkedin_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeLinkedInPost);
}

export async function getLinkedInPostByIdForAdmin(id: string): Promise<LinkedInPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("linkedin_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeLinkedInPost(data) : null;
}

/** Notas para elegir como fuente (las más recientes primero). */
export async function getPostOptionsForLinkedIn(): Promise<
  { id: string; title: string; status: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, status")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}
