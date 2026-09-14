import { z } from "zod";

export const glossaryCategorySchema = z.enum(["ga4", "ads", "ia", "seo"]);

export const GLOSSARY_CATEGORY_LABELS: Record<z.infer<typeof glossaryCategorySchema>, string> = {
  ga4: "GA4",
  ads: "Ads",
  ia: "IA",
  seo: "SEO",
};

// ---- Generación asistida por IA ----

export const glossaryGenerateInputSchema = z.object({
  term: z.string().min(2, "Mínimo 2 caracteres."),
  category: glossaryCategorySchema,
});

export const glossaryFormulaComponentSchema = z.object({
  label: z.string().min(1).describe("Nombre de la variable/componente de la fórmula, ej. 'Conversiones'."),
  symbol: z
    .string()
    .optional()
    .describe("Símbolo o abreviatura corta de esa variable, ej. 'conv.' (opcional)."),
});

export const glossaryFormulaSchema = z.object({
  expression: z
    .string()
    .min(1)
    .describe("La fórmula completa en texto, ej. '(Conversiones / Sesiones) × 100'."),
  components: z
    .array(glossaryFormulaComponentSchema)
    .min(1)
    .describe("Cada variable de la fórmula desglosada, en el orden en que aparecen."),
});

export const glossaryComparisonTableSchema = z.object({
  headers: z.array(z.string().min(1)).min(2).describe("Encabezados de columna de la tabla."),
  rows: z
    .array(z.array(z.string()))
    .min(1)
    .describe("Filas de la tabla; cada fila tiene la misma cantidad de celdas que headers."),
});

export const glossaryFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

// El schema que efectivamente le pedimos generar al modelo vive en
// src/lib/glossary-ai-schema.ts, en zod/v4 — es lo que exige el helper
// zodOutputFormat del SDK de Anthropic. Este archivo (validations/glossary.ts)
// sigue en zod v3 clásico, consistente con el resto de validations/*, y solo
// se usa para validar lo que el admin edita/envía, no la llamada a la IA.

// ---- Guardar el término (crear/editar) ----

export const glossaryTermFormSchema = z.object({
  term: z.string().min(2, "Mínimo 2 caracteres."),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usá minúsculas, números y guiones."),
  category: glossaryCategorySchema,
  quick_answer: z.string().optional().or(z.literal("")),
  has_formula: z.boolean().optional().default(false),
  formula: glossaryFormulaSchema.optional().nullable(),
  extended_explanation: z.string().optional().or(z.literal("")),
  example: z.string().optional().or(z.literal("")),
  comparison_table: glossaryComparisonTableSchema.optional().nullable(),
  related_terms: z.array(z.string()).optional().default([]),
  faqs: z.array(glossaryFaqSchema).optional().default([]),
  author_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
});

export type GlossaryTermFormValues = z.infer<typeof glossaryTermFormSchema>;
