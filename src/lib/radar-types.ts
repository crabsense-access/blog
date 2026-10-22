// Tipos del Radar de novedades (/admin/linkedin/radar). Sin imports de
// servidor: lo usan las páginas, los componentes y la generación de posts.

export interface RelatedLink {
  title: string;
  url: string;
  source: string;
  type: "official" | "expert";
  /** de qué habla y qué aporta, en español */
  summary: string;
  /** de qué búsqueda salió: Google Argentina (título en español), Google en
   *  inglés (título traducido) o agregado a mano. Los viejos no lo tienen. */
  origin?: "google_ar" | "google_en" | "manual";
}

export type NewsItemStatus = "new" | "selected" | "discarded" | "used";

export interface NewsItem {
  id: string;
  scan_id: string | null;
  platform: string;
  service: "analytics" | "seo" | "ads" | "ia";
  title: string;
  summary: string;
  why_it_matters: string;
  ai_angle: string | null;
  source_url: string;
  source_name: string | null;
  source_type: "official" | "expert";
  source_language: string;
  published_date: string | null;
  relevance: number;
  related_links: RelatedLink[];
  related_fetched_at: string | null;
  status: NewsItemStatus;
  linkedin_post_id: string | null;
  created_at: string;
}

export interface NewsScan {
  id: string;
  trigger: "cron" | "manual";
  status: "running" | "done" | "error";
  error: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
  finished_at: string | null;
}

/** Plataformas que vigila el radar (orden de prioridad para el mix de 6). */
export const RADAR_PLATFORMS = ["GA4", "Google Ads", "Meta Ads", "Instagram Ads", "SEO", "GEO"] as const;

export const RELATED_ORIGIN_LABELS: Record<NonNullable<RelatedLink["origin"]>, string> = {
  google_ar: "Google AR",
  google_en: "Google EN",
  manual: "Agregado a mano",
};
