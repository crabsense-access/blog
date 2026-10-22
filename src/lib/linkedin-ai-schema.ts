// Usa zod/v4 por el mismo motivo que post-ai-schema.ts / glossary-ai-schema.ts:
// zodOutputFormat (de @anthropic-ai/sdk/helpers/zod) tipa contra zod/v4.
import { z } from "zod/v4";

const slideSchema = z.object({
  kind: z
    .enum(["cover", "stat", "list", "text", "compare", "cta"])
    .describe("Tipo de slide."),
  eyebrow: z.string().describe("Etiqueta corta en mayúsculas arriba del título (2-5 palabras). Puede ser vacía."),
  title: z
    .string()
    .describe(
      "Título de la slide, máximo ~12 palabras. Marcá entre **dobles asteriscos** la parte clave a destacar en color."
    ),
  body: z.string().describe("Texto de apoyo, máximo ~35 palabras. Vacío si no aplica."),
  value: z.string().describe("Solo para kind stat: la cifra grande, ej. '17%' o '+180%'. Vacío si no aplica."),
  items: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .describe("Solo para kind list: 3 a 5 items; title de 1-5 palabras y description de máximo ~15 palabras. Vacío si no aplica."),
  bars: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().describe("0 a 100, proporcional al dato real"),
        display: z.string().describe("Texto que se ve en la barra, ej. '76%'"),
      })
    )
    .describe("Solo para kind stat: 2-3 barras de comparación con números reales. Vacío si no hay comparación."),
  left_label: z
    .string()
    .describe("Solo compare: etiqueta del panel de ARRIBA, que se muestra tachado como lo incorrecto: 'Antes', 'Mito' o 'No funciona'."),
  left_body: z.string().describe("Solo compare: texto izquierdo, máximo ~30 palabras."),
  right_label: z
    .string()
    .describe("Solo compare: etiqueta del panel de ABAJO, que se muestra destacado como lo correcto: 'Después', 'Realidad' o 'Funciona'."),
  right_body: z.string().describe("Solo compare: texto derecho, máximo ~30 palabras."),
  list_style: z
    .enum(["roman", "check", "cross"])
    .describe("Solo list: 'roman' para numerar (I, II…), 'check' para pasos a hacer, 'cross' para errores."),
  source: z.string().describe("Fuente del dato (medio + fecha), si la slide tiene cifras. Vacío si no."),
  button: z.string().describe("Solo cta: texto de la pill, ej. 'Leela en crabsense.com/blog'."),
  figure: z
    .enum(["none", "pedestal", "estatua", "coliseo", "catapulta"])
    .describe(
      "Figura de mármol. Usala SOLO en la slide cover y en la cta (en el resto poné 'none', no se muestra). pedestal = SEO/GEO/IA; estatua = analytics/usuarios; coliseo = resultados/crecimiento; catapulta = paid media/Meta/Ads. 'none' en el resto."
    ),
});

export const linkedInGeneratedSchema = z.object({
  title: z.string().describe("Título interno corto para identificar el post en el admin."),
  caption: z
    .string()
    .describe(
      "Texto del post de LinkedIn en español rioplatense. La primera línea es el gancho (se ve antes del '…más'). Párrafos cortos, sin links (el link va en el primer comentario), máximo 2 emojis o ninguno, sin hashtags (van aparte)."
    ),
  first_comment: z
    .string()
    .describe("Primer comentario: el link correspondiente con una frase corta. Vacío si no hay link."),
  hashtags: z.array(z.string()).describe("3 a 5 hashtags sin el símbolo #."),
  slides: z.array(slideSchema).describe("Slides del carrusel/imagen según la estructura pedida. Vacío para posts de solo texto sin imagen."),
});

export type LinkedInGenerated = z.infer<typeof linkedInGeneratedSchema>;

// ---- Tipo II · Novedad de producto (plantilla con diseño propio) ----

const updateTemplateSchema = z.object({
  platform: z.string().describe("Texto corto de la pill de plataforma, en mayúsculas o como se escribe la marca: 'GA4', 'Google Ads', 'Meta Ads', 'Instagram', 'Search Console', 'GEO'."),
  service: z
    .enum(["analytics", "seo", "ads", "ia"])
    .describe("Servicio de Crabsense: analytics (GA4, GTM), ads (Google/Meta/Instagram/LinkedIn Ads), seo (SEO, GEO, Search Console, AI Overviews/LLMs), ia (IA general)."),
  date_label: z.string().describe("Fecha del anuncio oficial en formato '21 SEP 2026' (mes abreviado en español, mayúsculas). Vacío si no se conoce con certeza."),
  headline: z
    .string()
    .describe("Titular de portada: qué podés hacer ahora (el beneficio), no el nombre técnico. Máximo 12 palabras. Marcá entre **dobles asteriscos** 1 a 2 palabras clave."),
  lead: z.string().describe("Bajada de portada: una frase de máximo 18 palabras que nombra la función nueva."),
  changed_title: z.string().describe("Título de la slide 'Qué cambió': el cambio en una frase tipo 'De X a **Y**', máximo 9 palabras."),
  before_label: z.string().describe("Etiqueta del panel 'antes', ej. 'Antes · Excluir'. Corta."),
  before_note: z.string().describe("Nota breve del antes (3-5 palabras), ej. 'una lista que nunca termina'. Puede ser vacía."),
  before_items: z
    .array(z.string())
    .describe("2 a 3 ítems concretos de cómo era antes (valores, opciones, ejemplos reales de UI). Máximo 5 palabras cada uno. El último puede empezar con '+' para un cierre en itálica, ej. '+ y el que aparezca mañana…'."),
  after_label: z.string().describe("Etiqueta del panel 'ahora', ej. 'Ahora · Incluir solo'. Corta."),
  after_note: z.string().describe("Nota breve del ahora (3-5 palabras). Puede ser vacía."),
  after_items: z.array(z.string()).describe("2 a 3 ítems concretos de cómo es ahora. Máximo 5 palabras cada uno."),
  fine_title: z.string().describe("Título de 'La letra chica', ej. '3 cosas que conviene saber **antes de activarlo**'."),
  fine_items: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .describe("EXACTAMENTE 3 detalles de la letra chica que la documentación oficial dice al pasar: límites, excepciones, si es retroactivo, disponibilidad. title máx. 7 palabras, description máx. 18 palabras."),
  steps_title: z.string().describe("Título de 'Qué hacer', ej. 'Cómo activarlo **sin perder datos reales**'. Máximo 8 palabras."),
  steps: z
    .array(z.object({ title: z.string(), description: z.string(), when: z.string() }))
    .describe("3 a 4 pasos accionables en imperativo (voseo). title máx. 6 palabras, description máx. 12 palabras, when = momento corto: 'Hoy', 'Esta semana', '24–36 h', 'Después'."),
  verdict: z
    .string()
    .describe("Nuestra lectura: opinión de Crabsense con postura propia en 1 o 2 frases, máximo 30 palabras, con 1 parte entre **dobles asteriscos**. Incluí el ángulo de IA si aplica."),
  impact: z.number().int().min(1).max(3).describe("Impacto para marcas y equipos de marketing: 1 bajo, 2 medio, 3 alto."),
  urgency: z.number().int().min(1).max(3).describe("Urgencia para actuar: 1 baja, 2 media, 3 alta."),
  cta: z.string().describe("Texto del botón final hacia el contacto de Crabsense, ej. '¿Lo revisamos en tu propiedad?'. Máximo 6 palabras."),
});

export const linkedInUpdateGeneratedSchema = z.object({
  title: z.string().describe("Título interno corto para identificar el post en el admin."),
  caption: z
    .string()
    .describe(
      "Texto del post en español rioplatense: 6 a 10 líneas. Primera línea = gancho con el beneficio concreto. Adelanta las 3 partes del carrusel (qué cambió, letra chica, cómo aplicarlo) con flechas →. Cierra con una pregunta abierta. Sin links ni hashtags."
    ),
  first_comment: z.string().describe("Primer comentario: link a la fuente oficial (y si hay, 1 referente) con una frase corta, más el link de contacto https://crabsense.com/#contacto."),
  hashtags: z.array(z.string()).describe("3 a 5 hashtags sin el símbolo #."),
  update: updateTemplateSchema,
});

export type LinkedInUpdateGenerated = z.infer<typeof linkedInUpdateGeneratedSchema>;
