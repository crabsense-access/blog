// Servicios de la home ("Nuestros servicios"). Lista compartida entre el
// bloque público y el admin de imágenes (/admin/services).
export const SERVICE_LIST = [
  { slug: "analytics", name: "Analytics" },
  { slug: "seo", name: "SEO & GEO" },
  { slug: "ads", name: "ADS" },
  { slug: "ia", name: "IA" },
] as const;

export type ServiceSlug = (typeof SERVICE_LIST)[number]["slug"];

export interface ServiceImage {
  slug: string;
  image_url: string | null;
  image_alt: string | null;
}

/** Problema ("issue") de un servicio, tal como se muestra en la home */
export interface ServiceIssue {
  /** el dolor de cabeza, en palabras del cliente */
  title: string;
  description: string;
  /** cómo lo resolvemos (bullets de "Cómo te ayudamos") */
  help: string[];
}

/** Fila de la tabla service_issues (editable desde /admin/services) */
export interface ServiceIssueRow extends ServiceIssue {
  id: string;
  service_slug: string;
  sort_order: number;
}
