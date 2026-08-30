import { createClient } from "@/lib/supabase/server";
import type { Tag } from "@/lib/types";

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
