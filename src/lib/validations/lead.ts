import { z } from "zod";

export const LEAD_SERVICES = ["seo", "ads", "analytics", "ia"] as const;
export type LeadService = (typeof LEAD_SERVICES)[number];

export const LEAD_SERVICE_OPTIONS: {
  value: LeadService;
  label: string;
  description: string;
  /** mismo color que la categoría del blog del servicio */
  color: string;
}[] = [
  { value: "seo", label: "SEO", description: "Posicionamiento orgánico y contenidos", color: "#3f787e" },
  { value: "ads", label: "ADS", description: "Google, Meta y LinkedIn Ads", color: "#4ba5b9" },
  { value: "analytics", label: "ANALYTICS", description: "GA4, GTM y medición", color: "#53539b" },
  { value: "ia", label: "IA", description: "Automatización e IA aplicada", color: "#464444" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Devuelve "email" | "phone" | null según lo que haya escrito la persona. */
export function detectContactType(value: string): "email" | "phone" | null {
  const v = value.trim();
  if (EMAIL_RE.test(v)) return "email";
  const digits = v.replace(/[^\d]/g, "");
  if (/^\+?[\d\s().-]+$/.test(v) && digits.length >= 8 && digits.length <= 15) return "phone";
  return null;
}

/**
 * Normaliza lo que escribe la persona como sitio web ("miweb.com",
 * "www.miweb.com.ar/algo", "https://…") a una URL con https://. Devuelve null
 * si no parece un dominio válido.
 */
export function normalizeWebsite(value: string): string | null {
  const v = value.trim();
  if (!v || /\s/.test(v)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export const leadSchema = z.object({
  services: z.array(z.enum(LEAD_SERVICES)).max(4),
  message: z.string().trim().max(2000),
  contact: z
    .string()
    .trim()
    .min(5, "Ingresá un email o celular.")
    .max(160)
    .refine((v) => detectContactType(v) !== null, "Ingresá un email o un celular válido."),
  website_url: z
    .string()
    .trim()
    .min(1, "Ingresá tu sitio web.")
    .max(300)
    .refine((v) => normalizeWebsite(v) !== null, "Ingresá un sitio web válido (ej. tuempresa.com).")
    .transform((v) => normalizeWebsite(v)!),
  page_path: z.string().max(300).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
