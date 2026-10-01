import { z } from "zod";

import { normalizeWebsite } from "@/lib/validations/lead";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

export const successCaseFormSchema = z.object({
  client_name: z.string().trim().min(2, "Mínimo 2 caracteres.").max(120),
  title: z.string().trim().min(4, "Mínimo 4 caracteres.").max(160),
  description: optionalText(600),
  metric_value: optionalText(30),
  metric_label: optionalText(80),
  service: z
    .enum(["none", "analytics", "seo", "ads", "ia"])
    .optional()
    .transform((v) => (v && v !== "none" ? v : null)),
  // Opcional. Acepta rutas internas ("/blog/mi-nota") o URLs externas.
  link_url: z
    .string()
    .trim()
    .max(300)
    .optional()
    .refine((v) => !v || v.startsWith("/") || normalizeWebsite(v) !== null, {
      message: "Link inválido (ej. /blog/mi-nota o empresa.com).",
    })
    .transform((v) => (!v ? null : v.startsWith("/") ? v : normalizeWebsite(v))),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_published: z
    .union([z.literal("on"), z.literal("")])
    .optional()
    .transform((v) => v === "on"),
});

export type SuccessCaseFormValues = z.infer<typeof successCaseFormSchema>;
