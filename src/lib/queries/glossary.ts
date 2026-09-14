import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { GlossaryCategory, GlossaryTermWithRelations } from "@/lib/types";

export const GLOSSARY_TERM_SELECT = `
  *,
  author:profiles(id, full_name, email, public_title, avatar_url)
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeGlossaryTerm(raw: any): GlossaryTermWithRelations {
  return { ...raw };
}

export async function getPublishedGlossaryTermsByCategory(
  category: GlossaryCategory
): Promise<GlossaryTermWithRelations[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select(GLOSSARY_TERM_SELECT)
    .eq("status", "published")
    .eq("category", category)
    .order("term", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeGlossaryTerm);
}

export async function getGlossaryTermBySlug(
  category: GlossaryCategory,
  slug: string
): Promise<GlossaryTermWithRelations | null> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select(GLOSSARY_TERM_SELECT)
    .eq("status", "published")
    .eq("category", category)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeGlossaryTerm(data) : null;
}

export interface GlossaryTermLight {
  term: string;
  slug: string;
  category: GlossaryCategory;
}

// Usado para resolver los related_terms (sugeridos por nombre por la IA) a
// links reales cuando ya existe un término publicado con ese nombre.
export async function getAllPublishedGlossaryTermsLight(): Promise<GlossaryTermLight[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select("term, slug, category")
    .eq("status", "published");

  if (error) throw error;
  return data ?? [];
}

export async function getGlossaryCategoryCounts(): Promise<Record<GlossaryCategory, number>> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select("category")
    .eq("status", "published");

  if (error) throw error;

  const counts: Record<GlossaryCategory, number> = { ga4: 0, ads: 0, ia: 0, seo: 0 };
  for (const row of data ?? []) {
    const category = row.category as GlossaryCategory;
    counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

// ---- Admin ----

export async function getAllGlossaryTermsForAdmin(): Promise<GlossaryTermWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select(GLOSSARY_TERM_SELECT)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeGlossaryTerm);
}

export async function getGlossaryTermByIdForAdmin(
  id: string
): Promise<GlossaryTermWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select(GLOSSARY_TERM_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeGlossaryTerm(data) : null;
}

export async function isGlossarySlugTaken(
  category: GlossaryCategory,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("glossary_terms")
    .select("id", { count: "exact", head: true })
    .eq("category", category)
    .eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return (count ?? 0) > 0;
}
