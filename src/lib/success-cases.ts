// Casos de éxito de la home (tabla success_cases, admin en /admin/casos).
export interface SuccessCase {
  id: string;
  client_name: string;
  title: string;
  description: string | null;
  metric_value: string | null;
  metric_label: string | null;
  service: string | null;
  image_url: string | null;
  logo_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

// Color de la pill según el servicio (los mismos de "Nuestros servicios").
export const SUCCESS_CASE_SERVICES = [
  { slug: "analytics", name: "Analytics", color: "#53539b" },
  { slug: "seo", name: "SEO & GEO", color: "#3f787e" },
  { slug: "ads", name: "ADS", color: "#4ba5b9" },
  { slug: "ia", name: "IA", color: "#3d3c89" },
] as const;

export function successCaseService(slug: string | null) {
  return SUCCESS_CASE_SERVICES.find((s) => s.slug === slug) ?? null;
}
