// zod/v4 por el mismo motivo que post-ai-schema.ts (zodOutputFormat tipa contra v4).
import { z } from "zod/v4";

const radarItemSchema = z.object({
  platform: z
    .enum(["GA4", "Google Ads", "Meta Ads", "Instagram Ads", "SEO", "GEO"])
    .describe("Plataforma principal de la novedad."),
  service: z
    .enum(["analytics", "seo", "ads", "ia"])
    .describe("analytics = GA4/GTM; ads = Google Ads, Meta, Instagram; seo = SEO y GEO; ia = novedad centrada en IA que no encaja en las otras."),
  title: z.string().describe("Título de la novedad en español, claro y concreto, máximo 14 palabras."),
  summary: z.string().describe("Qué cambió exactamente, en español, 2 o 3 frases. Incluí fecha de lanzamiento o de entrada en vigencia si la hay."),
  why_it_matters: z.string().describe("Por qué le importa a una marca o equipo de marketing, en español, 1 o 2 frases."),
  ai_angle: z
    .string()
    .nullable()
    .describe("Relación con IA (funciones con IA, automatización, IA generativa, AI Overviews, LLMs), en español, 1 frase. null si no tiene relación real."),
  source_url: z
    .string()
    .describe("URL de la fuente que encontraste con la búsqueda web. Preferí la página oficial del anuncio. Nunca inventes una URL."),
  source_name: z.string().describe("Nombre del sitio o autor, ej. 'Google Analytics Help', 'Search Engine Land', 'Simo Ahava'."),
  source_type: z.enum(["official", "expert"]).describe("official = documentación, blog o centro de ayuda de la propia herramienta; expert = medio o referente."),
  source_language: z.enum(["en", "es"]),
  published_date: z
    .string()
    .nullable()
    .describe("Fecha de publicación del anuncio en formato YYYY-MM-DD, o null si no aparece."),
  relevance: z.number().int().min(1).max(5).describe("Relevancia para el público de Crabsense (marketing, analytics, e-commerce en LATAM): 5 = muy alta."),
});

export const radarScanSchema = z.object({
  items: z.array(radarItemSchema).describe("Las novedades pedidas (distintas entre sí), ordenadas de mayor a menor relevancia."),
});

export type RadarScanResult = z.infer<typeof radarScanSchema>;

export const relatedLinksSchema = z.object({
  links: z
    .array(
      z.object({
        title: z.string().describe("Título del artículo o página, en su idioma original."),
        url: z.string().describe("URL encontrada con la búsqueda web. Nunca inventes una URL."),
        source: z.string().describe("Sitio o autor, ej. 'Analytics Mania (Julius Fedorovicius)'."),
        type: z.enum(["official", "expert"]),
        summary: z.string().describe("En español, 1 o 2 frases: qué dice y qué aporta para escribir el post (dato, ejemplo, opinión, caso)."),
      })
    )
    .describe("3 a 6 referencias sobre el mismo tema, distintas de la fuente principal."),
});

export type RelatedLinksResult = z.infer<typeof relatedLinksSchema>;

/**
 * Referentes "tipo Google": la IA hace UNA búsqueda con una consulta fija y
 * devuelve los primeros resultados en el orden en que aparecieron.
 */
export const serpLinksSchema = z.object({
  query: z.string().describe("La consulta exacta que usaste en la búsqueda web."),
  results: z
    .array(
      z.object({
        title: z.string().describe("Título del resultado, en su idioma original."),
        url: z.string().describe("URL tal cual apareció en los resultados. Nunca inventes una URL."),
        source: z.string().describe("Sitio o medio, ej. 'Search Engine Journal'."),
        type: z
          .enum(["official", "expert"])
          .describe("official = documentación/blog/ayuda de la propia plataforma (Google, Meta, etc.); expert = cualquier otro."),
        summary: z.string().describe("En español, 1 o 2 frases: qué dice y qué aporta sobre el tema."),
      })
    )
    .max(3)
    .describe("Los primeros 3 resultados, en el orden en que aparecieron."),
});

export type SerpLinksResult = z.infer<typeof serpLinksSchema>;
