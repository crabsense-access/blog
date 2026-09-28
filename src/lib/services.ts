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
