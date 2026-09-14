// Usa zod/v4 (el submódulo que trae el propio paquete "zod" instalado,
// v3.25+) porque @anthropic-ai/sdk/helpers/zod (zodOutputFormat) tipa su
// parámetro contra zod/v4, no contra el zod v3 clásico que usa el resto del
// proyecto (validations/*.ts). No mezclar: un ZodObject v3 no satisface el
// tipo que espera zodOutputFormat.
import { z } from "zod/v4";

const glossaryFormulaComponentSchema = z.object({
  label: z.string().min(1).describe("Nombre de la variable/componente de la fórmula, ej. 'Conversiones'."),
  symbol: z
    .string()
    .optional()
    .describe("Símbolo o abreviatura corta de esa variable, ej. 'conv.' (opcional)."),
});

const glossaryFormulaSchema = z.object({
  expression: z
    .string()
    .min(1)
    .describe("La fórmula completa en texto, ej. '(Conversiones / Sesiones) × 100'."),
  components: z
    .array(glossaryFormulaComponentSchema)
    .min(1)
    .describe("Cada variable de la fórmula desglosada, en el orden en que aparecen."),
});

const glossaryComparisonTableSchema = z.object({
  headers: z.array(z.string().min(1)).min(2).describe("Encabezados de columna de la tabla."),
  rows: z
    .array(z.array(z.string()))
    .min(1)
    .describe("Filas de la tabla; cada fila tiene la misma cantidad de celdas que headers."),
});

const glossaryFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

// Lo que le pedimos al modelo que genere — un solo objeto con todos los
// campos, para completar el formulario de una sola pasada.
export const glossaryGeneratedContentSchema = z.object({
  quick_answer: z
    .string()
    .min(1)
    .describe("Definición corta y precisa del término, de 40 a 60 palabras."),
  has_formula: z
    .boolean()
    .describe(
      "true solo si el término es una métrica/KPI que se calcula con una fórmula matemática (ej. tasa de conversión, ROAS, CTR); false para conceptos, herramientas o procesos sin fórmula."
    ),
  formula: glossaryFormulaSchema
    .nullable()
    .describe("La fórmula desglosada en componentes si has_formula es true; null si es false."),
  extended_explanation: z
    .string()
    .min(1)
    .describe(
      "Explicación extendida en Markdown, 1 a 2 párrafos, que incluya al menos un dato o estadística concreta."
    ),
  example: z
    .string()
    .min(1)
    .describe("Ejemplo concreto en Markdown, con números reales, de cómo se aplica el término."),
  has_comparison_table: z
    .boolean()
    .describe(
      "true solo si este término suele confundirse con otro término similar y vale la pena compararlos en una tabla; false en caso contrario."
    ),
  comparison_table: glossaryComparisonTableSchema
    .nullable()
    .describe("Tabla comparativa si has_comparison_table es true; null si es false."),
  related_terms: z
    .array(z.string().min(1))
    .min(3)
    .max(5)
    .describe("3 a 5 nombres de términos relacionados de la misma categoría (solo el nombre, no un slug)."),
  faqs: z
    .array(glossaryFaqSchema)
    .min(2)
    .max(4)
    .describe("2 a 4 preguntas frecuentes sobre el término, con su respuesta."),
});

export type GlossaryGeneratedContent = z.infer<typeof glossaryGeneratedContentSchema>;
