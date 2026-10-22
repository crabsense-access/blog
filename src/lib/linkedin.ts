// Tipos y configuración compartida del módulo de posts de LinkedIn
// (/admin/linkedin). Lo usan el renderer de slides, el editor y la
// generación con IA, así que no importa nada de servidor.

export type LinkedInPostType =
  | "article"
  | "product_update"
  | "stat"
  | "success_case"
  | "before_after"
  | "opinion"
  | "checklist";

export type LinkedInFormat = "carousel" | "image_carousel" | "image" | "text";

/** Formatos de carrusel: PDF (documento de LinkedIn) o varias imágenes. */
export const isCarouselFormat = (f: LinkedInFormat) => f === "carousel" || f === "image_carousel";
export type LinkedInStatus = "draft" | "approved" | "published";
export type LinkedInStyle = "light" | "dark";

export type SlideKind = "cover" | "stat" | "list" | "text" | "compare" | "cta";
export type SlideFigure = "none" | "pedestal" | "estatua" | "coliseo" | "catapulta";

export interface SlideItem {
  title: string;
  description: string;
}

export interface SlideBar {
  label: string;
  /** 0-100, define el largo de la barra */
  value: number;
  /** texto que se muestra en la barra, ej. "76%" o "+30–40%" */
  display: string;
}

/**
 * Una slide del carrusel. Estructura plana con campos opcionales según el
 * kind (más simple de editar y de pedirle a la IA que una unión).
 * En title, el texto entre **dobles asteriscos** se pinta en el color de
 * acento (ej. "Los LLMs no citan páginas. **Citan fragmentos.**").
 */
export interface LinkedInSlide {
  kind: SlideKind;
  eyebrow: string;
  title: string;
  body: string;
  /** stat: el número grande (ej. "17%") */
  value: string;
  items: SlideItem[];
  bars: SlideBar[];
  /** compare: columna izquierda (antes / mito) y derecha (después / realidad) */
  left_label: string;
  left_body: string;
  right_label: string;
  right_body: string;
  /** list: numerar en romanos o mostrar checks */
  list_style: "roman" | "check" | "cross";
  source: string;
  /** cta: texto de la pill */
  button: string;
  figure: SlideFigure;
}

export interface LinkedInPost {
  id: string;
  type: LinkedInPostType;
  title: string;
  format: LinkedInFormat;
  source_post_id: string | null;
  source_case_id: string | null;
  source_url: string | null;
  platform: string | null;
  source_notes: string | null;
  caption: string;
  first_comment: string;
  hashtags: string[];
  slides: LinkedInSlide[];
  style: LinkedInStyle;
  publish_as_profile_id: string | null;
  status: LinkedInStatus;
  scheduled_for: string | null;
  /** "HH:MM:SS" (Postgres time) o null */
  scheduled_time: string | null;
  news_item_id: string | null;
  /** datos de plantillas con diseño propio (tipo II, ver linkedin-update.ts) */
  template_data: unknown;
  published_at: string | null;
  linkedin_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function emptySlide(kind: SlideKind = "text"): LinkedInSlide {
  return {
    kind,
    eyebrow: "",
    title: "",
    body: "",
    value: "",
    items: [],
    bars: [],
    left_label: "",
    left_body: "",
    right_label: "",
    right_body: "",
    list_style: "roman",
    source: "",
    button: "",
    figure: "none",
  };
}

/** Completa campos faltantes (slides guardadas o devueltas por la IA). */
export function normalizeSlide(raw: Partial<LinkedInSlide> | null | undefined): LinkedInSlide {
  const base = emptySlide(raw?.kind ?? "text");
  return {
    ...base,
    ...Object.fromEntries(Object.entries(raw ?? {}).filter(([, v]) => v !== null && v !== undefined)),
    items: Array.isArray(raw?.items) ? raw!.items : [],
    bars: Array.isArray(raw?.bars) ? raw!.bars : [],
  } as LinkedInSlide;
}

export const SLIDE_KIND_LABELS: Record<SlideKind, string> = {
  cover: "Portada",
  stat: "Dato / cifra",
  list: "Lista",
  text: "Texto",
  compare: "Comparación (antes/después)",
  cta: "Cierre / CTA",
};

export const FIGURES: Record<Exclude<SlideFigure, "none">, { src: string; label: string }> = {
  pedestal: { src: "/linkedin/pedestal-ai-overview.webp", label: "Pedestal AI Overview (SEO/GEO)" },
  estatua: { src: "/linkedin/estatua-celular.webp", label: "Estatua con celular (Analytics/usuario)" },
  coliseo: { src: "/linkedin/coliseo-flecha.webp", label: "Coliseo con flecha (resultados)" },
  catapulta: { src: "/linkedin/catapulta.webp", label: "Catapulta (Paid Media / Meta)" },
};

export const FIGURE_OPTIONS: { value: SlideFigure; label: string }[] = [
  { value: "none", label: "Sin figura" },
  ...Object.entries(FIGURES).map(([value, f]) => ({ value: value as SlideFigure, label: f.label })),
];

export const PLATFORMS = [
  "GA4",
  "Google Tag Manager",
  "Google Ads",
  "Meta Ads",
  "Instagram Ads",
  "LinkedIn Ads",
  "SEO",
  "Search Console",
  "GEO",
  "Otra",
] as const;

export const STATUS_LABELS: Record<LinkedInStatus, string> = {
  draft: "Borrador",
  approved: "Aprobado",
  published: "Publicado",
};

export const FORMAT_LABELS: Record<LinkedInFormat, string> = {
  carousel: "Carrusel (PDF)",
  image_carousel: "Carrusel (imágenes)",
  image: "Imagen única",
  text: "Solo texto",
};

/** Qué fuente pide cada tipo en el formulario. */
export type SourceField = "post" | "case" | "url" | "platform" | "notes";

export interface LinkedInTypeConfig {
  label: string;
  numeral: string;
  short: string;
  description: string;
  defaultFormat: LinkedInFormat;
  sources: SourceField[];
  /** Fuentes obligatorias para poder generar */
  required: SourceField[];
  notesLabel: string;
  notesPlaceholder: string;
  /** Instrucciones de estructura para la IA */
  structure: string;
  /** Si la IA puede usar búsqueda web */
  webSearch: boolean;
  defaultFigure: SlideFigure;
}

export const LINKEDIN_TYPES: Record<LinkedInPostType, LinkedInTypeConfig> = {
  article: {
    label: "Nueva nota del blog",
    numeral: "I",
    short: "Nota",
    description: "Carrusel de 6–8 slides que resume una nota publicada. El link va en el primer comentario.",
    defaultFormat: "carousel",
    sources: ["post", "notes"],
    required: ["post"],
    notesLabel: "Ángulo o indicaciones (opcional)",
    notesPlaceholder: "Ej: enfocalo en e-commerce, destacá la tabla del estudio…",
    structure: `Carrusel de 6 a 8 slides:
1) cover: gancho con la tesis de la nota (title con la parte clave entre **), body = bajada corta.
2-3) stat o text con los datos más fuertes de la nota (con source).
4-6) list / compare / text con el contenido accionable (bloques, pasos, reglas, errores).
última) cta: frase de cierre + button "Leela en crabsense.com/blog".
Usá solo datos que estén en la nota.`,
    webSearch: false,
    defaultFigure: "pedestal",
  },
  product_update: {
    label: "Novedad de producto",
    numeral: "II",
    short: "Novedad",
    description: "Qué cambió en GA4, Meta, Google Ads, GEO, etc., la letra chica y qué hacer. 5 slides con diseño propio.",
    defaultFormat: "carousel",
    sources: ["platform", "url", "notes"],
    required: ["platform"],
    notesLabel: "Qué cambió / tu lectura",
    notesPlaceholder: "Ej: GA4 sumó filtros de hostname 'Incluir'; para e-commerce con spam es clave porque…",
    structure: `Plantilla fija de 5 slides (se completa el objeto "update"):
I) portada: titular con el beneficio + bajada.
II) qué cambió: antes vs. ahora con ítems concretos de la interfaz o del comportamiento.
III) la letra chica: exactamente 3 detalles (límites, excepciones, retroactividad, disponibilidad).
IV) qué hacer: 3–4 pasos con su momento.
V) nuestra lectura: opinión + impacto + urgencia + CTA a contacto.
Verificá el anuncio en la fuente oficial con la búsqueda web; los referentes solo suman contexto y ángulos.`,
    webSearch: true,
    defaultFigure: "none",
  },
  stat: {
    label: "Dato con fuente",
    numeral: "III",
    short: "Dato",
    description: "Imagen única con una cifra grande, su contexto y la fuente. Ideal para estirar una nota.",
    defaultFormat: "image",
    sources: ["post", "url", "notes"],
    required: [],
    notesLabel: "Dato o tema",
    notesPlaceholder: "Ej: el 17% de las citas en AI Overviews viene del top 10 (BrightEdge, feb 2026)",
    structure: `UNA sola slide kind "stat": eyebrow corto, value = la cifra, title = qué significa (con la parte clave entre **), bars opcionales si hay una comparación con números reales, source obligatoria.
El caption desarrolla el dato en 4-6 líneas y termina con una pregunta.`,
    webSearch: true,
    defaultFigure: "none",
  },
  success_case: {
    label: "Caso de éxito",
    numeral: "IV",
    short: "Caso",
    description: "Problema → qué hicimos → resultado con números reales. Solo con permiso del cliente.",
    defaultFormat: "carousel",
    sources: ["case", "notes"],
    required: [],
    notesLabel: "Detalles del caso",
    notesPlaceholder: "Cliente, situación inicial, qué hicimos, resultados con números y plazo…",
    structure: `Carrusel de 5 a 6 slides:
1) cover: el resultado como titular (ej. "**+180%** de tráfico orgánico en 6 meses").
2) text: el punto de partida / problema.
3) list: qué hicimos (3-5 acciones).
4) stat: el resultado principal con value y bars si hay antes/después.
5) text opcional: aprendizaje para otros.
6) cta: "¿Querés resultados así?" + button.
No inventes números: usá solo los del caso.`,
    webSearch: false,
    defaultFigure: "coliseo",
  },
  before_after: {
    label: "Antes / después",
    numeral: "V",
    short: "Antes/después",
    description: "Teardown: un H2, un informe de GA4 o un tracking roto, y cómo queda bien hecho.",
    defaultFormat: "carousel",
    sources: ["url", "notes"],
    required: ["notes"],
    notesLabel: "El 'antes' y lo que querés mostrar",
    notesPlaceholder: "Pegá el texto/config original y qué cambiarías…",
    structure: `Carrusel de 3 a 5 slides:
1) cover: el problema en una frase.
2-3) compare: left_label "Antes", left_body = versión original; right_label "Después", right_body = versión mejorada (breves, que entren en la slide).
4) list con list_style "check": por qué funciona mejor.
5) cta.`,
    webSearch: false,
    defaultFigure: "pedestal",
  },
  opinion: {
    label: "Opinión / mito vs. realidad",
    numeral: "VI",
    short: "Opinión",
    description: "Texto largo con postura propia, ideal desde el perfil de un socio. Sin slides o con una sola.",
    defaultFormat: "text",
    sources: ["post", "notes"],
    required: ["notes"],
    notesLabel: "Tu postura",
    notesPlaceholder: "Ej: 'Mito: hay que repetir la keyword para rankear en IA.' Lo que pensás y por qué…",
    structure: `Post de solo texto, más de 1.000 caracteres, en primera persona del autor elegido: gancho en la primera línea (antes del "…más"), desarrollo con experiencia propia, cierre con pregunta abierta para comentarios.
slides: devolvé UNA slide kind "compare" con left_label "Mito" / right_label "Realidad" por si se quiere usar como imagen.`,
    webSearch: false,
    defaultFigure: "none",
  },
  checklist: {
    label: "Checklist / recurso guardable",
    numeral: "VII",
    short: "Checklist",
    description: "Documento de 5–7 slides para guardar: setup, auditoría, prompts, plantillas.",
    defaultFormat: "carousel",
    sources: ["post", "notes"],
    required: ["notes"],
    notesLabel: "Tema del checklist",
    notesPlaceholder: "Ej: checklist de robots.txt y crawlers de IA; setup mínimo de GA4 para e-commerce…",
    structure: `Carrusel de 5 a 7 slides:
1) cover: "Checklist: …" + body "Guardalo para tu próxima auditoría".
2-5) list con list_style "check", 3-5 items cada una, agrupados por etapa (eyebrow = etapa).
6) text opcional con el error más común.
última) cta: "Guardalo y compartilo con tu equipo".`,
    webSearch: true,
    defaultFigure: "pedestal",
  },
};

export const LINKEDIN_TYPE_ORDER: LinkedInPostType[] = [
  "article",
  "product_update",
  "stat",
  "success_case",
  "before_after",
  "opinion",
  "checklist",
];

export function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let rest = n;
  for (const [v, s] of map) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}
