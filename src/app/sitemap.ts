import type { MetadataRoute } from "next";

import { createPublicClient } from "@/lib/supabase/server";

// Sitemap dinámico: se arma desde Supabase con todo lo publicado y se
// regenera cada hora (sin redeploy) para incluir posts y términos nuevos.
export const revalidate = 3600;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://crabsense.com").replace(/\/$/, "");
const GLOSSARY_CATEGORIES = ["ga4", "ads", "ia", "seo"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [postsRes, categoriesRes, subcategoriesRes, glossaryRes] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, updated_at, published_at, canonical_url, author_id")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase.from("categories").select("id, slug"),
    supabase.from("subcategories").select("slug, category_id"),
    supabase
      .from("glossary_terms")
      .select("slug, category, updated_at")
      .eq("status", "published"),
  ]);

  const posts = postsRes.data ?? [];
  const categories = categoriesRes.data ?? [];
  const subcategories = subcategoriesRes.data ?? [];
  const glossaryTerms = glossaryRes.data ?? [];

  const latestPostDate = posts[0]?.updated_at ?? posts[0]?.published_at ?? undefined;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: latestPostDate, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/glosario`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.5 },
  ];

  // Posts con canonical apuntando a otra URL no van al sitemap (no son la
  // versión canónica).
  const postEntries: MetadataRoute.Sitemap = posts
    .filter((p) => {
      if (!p.canonical_url) return true;
      return p.canonical_url.replace(/\/$/, "") === `${SITE_URL}/blog/${p.slug}`;
    })
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updated_at ?? p.published_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/blog/categoria/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const subcategoryEntries: MetadataRoute.Sitemap = subcategories
    .filter((s) => categorySlugById.has(s.category_id))
    .map((s) => ({
      url: `${SITE_URL}/blog/categoria/${categorySlugById.get(s.category_id)}/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  // Solo autores con al menos un post publicado.
  const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))] as string[];
  const authorEntries: MetadataRoute.Sitemap = authorIds.map((id) => ({
    url: `${SITE_URL}/blog/autor/${id}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  const glossaryCategoryEntries: MetadataRoute.Sitemap = GLOSSARY_CATEGORIES.filter((cat) =>
    glossaryTerms.some((t) => t.category === cat)
  ).map((cat) => ({
    url: `${SITE_URL}/glosario/${cat}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const glossaryTermEntries: MetadataRoute.Sitemap = glossaryTerms.map((t) => ({
    url: `${SITE_URL}/glosario/${t.category}/${t.slug}`,
    lastModified: t.updated_at ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...postEntries,
    ...categoryEntries,
    ...subcategoryEntries,
    ...authorEntries,
    ...glossaryCategoryEntries,
    ...glossaryTermEntries,
  ];
}
