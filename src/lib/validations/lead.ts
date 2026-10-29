import { z } from "zod";

import {
  EMAIL_RE,
  LEAD_SERVICES,
  detectContactType,
  normalizeWebsite,
} from "@/lib/lead-shared";

export {
  EMAIL_RE,
  LEAD_SERVICES,
  LEAD_SERVICE_OPTIONS,
  detectContactType,
  normalizeWebsite,
  type LeadService,
} from "@/lib/lead-shared";

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

/** Formulario de contacto de la home (bloque "¿Listo para transformar tu negocio?") */
export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre.").max(120),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => EMAIL_RE.test(v), "Ingresá un email válido."),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((v) => !v || detectContactType(v) === "phone", "Ingresá un teléfono válido.")
    .transform((v) => v || null),
  website_url: z
    .string()
    .trim()
    .max(300)
    .refine((v) => !v || normalizeWebsite(v) !== null, "Ingresá un sitio web válido (ej. tuempresa.com).")
    .transform((v) => (v ? normalizeWebsite(v)! : null)),
  message: z.string().trim().max(2000, "El comentario es demasiado largo."),
  page_path: z.string().max(300).optional(),
});

export type ContactFormInput = z.input<typeof contactFormSchema>;
export type ContactFormField = keyof ContactFormInput;
