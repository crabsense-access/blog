// Usa zod/v4 (el submódulo que trae el propio paquete "zod" instalado,
// v3.25+) porque @anthropic-ai/sdk/helpers/zod (zodOutputFormat) tipa su
// parámetro contra zod/v4, no contra el zod v3 clásico que usa el resto del
// proyecto (validations/*.ts). Mismo criterio que src/lib/glossary-ai-schema.ts
// -- no mezclar: un ZodObject v3 no satisface el tipo que espera zodOutputFormat.
import { z } from "zod/v4";

const postGeneratedFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

// Lo que le pedimos al modelo que genere para completar el formulario de
// "Nueva nota" de una sola pasada -- con la herramienta de búsqueda web
// habilitada en la misma llamada (ver POST_SYSTEM_PROMPT en actions.ts) para
// fundamentar cifras y fuentes reales en vez de inventarlas.
export const postGeneratedContentSchema = z.object({
  title: z
    .string()
    .min(1)
    .describe(
      "Título de la nota, atractivo y SEO-friendly, sin comillas. Entre 50 y 70 caracteres aprox."
    ),
  excerpt: z
    .string()
    .min(1)
    .max(300)
    .describe(
      "Bajada de 1 a 2 frases con gancho, para mostrar en las cards del blog. Máximo 300 caracteres."
    ),
  quick_answer: z
    .string()
    .min(1)
    .describe(
      "Respuesta directa al tema principal de la nota, de 60 a 90 palabras, citando al menos un dato concreto encontrado con la búsqueda web. Texto plano o Markdown simple."
    ),
  content: z
    .string()
    .min(1)
    .describe(
      "Cuerpo completo de la nota en Markdown: exactamente 5 secciones de nivel 2 (##) de 2 a 4 párrafos cada una, más una sección final '## Fuentes' con 4 a 6 links en formato Markdown [Título de la fuente](URL) a las fuentes reales encontradas con la herramienta de búsqueda web. Nunca inventar una URL que no haya aparecido en un resultado de búsqueda."
    ),
  meta_title: z.string().min(1).max(70).describe("Meta title para SEO, máximo 70 caracteres."),
  meta_description: z
    .string()
    .min(1)
    .max(160)
    .describe("Meta description para SEO, máximo 160 caracteres."),
  faqs: z
    .array(postGeneratedFaqSchema)
    .min(3)
    .max(4)
    .describe(
      "3 o 4 preguntas frecuentes sobre el tema de la nota, con su respuesta, que no repitan literalmente el contenido del cuerpo."
    ),
});

export type PostGeneratedContent = z.infer<typeof postGeneratedContentSchema>;
