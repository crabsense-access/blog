// Plantilla visual del tipo II · Novedad de producto (aprobada el 2026-10-05,
// ver el doc del proyecto "linkedin-tipo-ii-novedades.md"). A diferencia de
// los demás tipos (slides genéricas), este tiene 5 slides fijas con datos
// estructurados que se guardan en linkedin_posts.template_data.

export type ServiceSlug = "analytics" | "seo" | "ads" | "ia";

export const SERVICE_COLORS: Record<ServiceSlug, { light: string; dark: string; label: string }> = {
  analytics: { light: "#53539b", dark: "#7d7bd0", label: "Analytics" },
  seo: { light: "#3f787e", dark: "#6fb3ba", label: "SEO & GEO" },
  ads: { light: "#4ba5b9", dark: "#7ecbd6", label: "ADS" },
  ia: { light: "#3d3c89", dark: "#8a86e0", label: "IA" },
};

/** Plataforma → servicio de Crabsense (define el color de la pill). */
export function serviceForPlatform(platform: string): ServiceSlug {
  const p = platform.toLowerCase();
  if (/(ga4|analytics|tag manager|gtm|bigquery|looker)/.test(p)) return "analytics";
  if (/(ads|meta|instagram|facebook|linkedin|tiktok|pmax|performance max)/.test(p)) return "ads";
  if (/(seo|search console|geo|llm|ai overview|ai mode|chatgpt|perplexity|bing)/.test(p)) return "seo";
  if (/(ia|ai|gemini|claude|openai)/.test(p)) return "ia";
  return "analytics";
}

export interface UpdateFineItem {
  title: string;
  description: string;
}

export interface UpdateStep {
  title: string;
  description: string;
  /** momento: "Hoy", "24–36 h", "Después"… */
  when: string;
}

export interface UpdateTemplate {
  /** texto de la pill de servicio, ej. "GA4" */
  platform: string;
  service: ServiceSlug;
  /** fecha del anuncio, ej. "21 SEP 2026" */
  date_label: string;
  /** I · portada — **texto** = destacado */
  headline: string;
  lead: string;
  /** II · qué cambió */
  changed_title: string;
  before_label: string;
  before_note: string;
  /** un ítem que empieza con "+" se muestra en itálica ("+ y el que aparezca mañana…") */
  before_items: string[];
  after_label: string;
  after_note: string;
  after_items: string[];
  /** III · letra chica (3) */
  fine_title: string;
  fine_items: UpdateFineItem[];
  /** IV · qué hacer (3–4) */
  steps_title: string;
  steps: UpdateStep[];
  /** V · nuestra lectura */
  verdict: string;
  impact: 1 | 2 | 3;
  urgency: 1 | 2 | 3;
  cta: string;
}

/** cantidad fija de slides de la plantilla (constante en un módulo sin "use client"
 *  para poder usarla desde Server Components) */
export const UPDATE_SLIDE_COUNT = 5;

export const CONTACT_URL = "https://crabsense.com/#contacto";

export const IMPACT_LABELS: Record<1 | 2 | 3, string> = { 1: "Bajo", 2: "Medio", 3: "Alto" };
export const URGENCY_LABELS: Record<1 | 2 | 3, string> = { 1: "Baja", 2: "Media", 3: "Alta" };

export function emptyUpdateTemplate(platform = "GA4"): UpdateTemplate {
  return {
    platform,
    service: serviceForPlatform(platform),
    date_label: "",
    headline: "",
    lead: "",
    changed_title: "",
    before_label: "Antes",
    before_note: "",
    before_items: [],
    after_label: "Ahora",
    after_note: "",
    after_items: [],
    fine_title: "3 cosas que conviene saber **antes de activarlo**",
    fine_items: [],
    steps_title: "",
    steps: [],
    verdict: "",
    impact: 2,
    urgency: 2,
    cta: "¿Lo revisamos en tu cuenta?",
  };
}

/** Completa campos faltantes de lo guardado en template_data o devuelto por la IA. */
export function normalizeUpdateTemplate(raw: unknown, fallbackPlatform = "GA4"): UpdateTemplate {
  const base = emptyUpdateTemplate(fallbackPlatform);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<UpdateTemplate>;
  const lvl = (v: unknown, d: 1 | 2 | 3): 1 | 2 | 3 => (v === 1 || v === 2 || v === 3 ? v : d);
  return {
    ...base,
    ...Object.fromEntries(Object.entries(r).filter(([, v]) => v !== null && v !== undefined)),
    service: r.service && r.service in SERVICE_COLORS ? r.service : serviceForPlatform(r.platform ?? fallbackPlatform),
    before_items: Array.isArray(r.before_items) ? r.before_items : [],
    after_items: Array.isArray(r.after_items) ? r.after_items : [],
    fine_items: Array.isArray(r.fine_items) ? r.fine_items : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
    impact: lvl(r.impact, 2),
    urgency: lvl(r.urgency, 2),
  } as UpdateTemplate;
}

export const UPDATE_SECTION_LABELS = ["", "Qué cambió", "La letra chica", "Qué hacer", "Nuestra lectura"] as const;
