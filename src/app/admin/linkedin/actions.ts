"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { createClient } from "@/lib/supabase/server";
import { LINKEDIN_TYPES, type LinkedInPostType } from "@/lib/linkedin";
import {
  linkedInGeneratedSchema,
  linkedInUpdateGeneratedSchema,
  type LinkedInGenerated,
} from "@/lib/linkedin-ai-schema";
import { normalizeUpdateTemplate, type UpdateTemplate } from "@/lib/linkedin-update";
import type { RelatedLink } from "@/lib/radar-types";
import { linkedInPostFormSchema } from "@/lib/validations/linkedin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crabsense.com";

const SYSTEM_PROMPT = `Sos el editor de LinkedIn de Crabsense, una agencia de marketing digital
especializada en Google Analytics 4, SEO/GEO, Google Ads, Meta Ads e IA aplicada
a marketing. Escribís en español rioplatense (voseo), con tono profesional,
directo y de especialista: frases cortas, sin relleno, sin clichés
("en el mundo de hoy", "es clave", "descubrí"), sin emojis en exceso.

Buenas prácticas de LinkedIn que tenés que respetar:
- La primera línea del caption es el gancho: se ve antes del "…más". Tiene que
  dar una razón concreta para seguir leyendo (un dato, una tensión, una postura).
- El algoritmo premia el tiempo de lectura y los comentarios, no los likes:
  cerrá con una pregunta que invite a responder con experiencia propia.
- Nunca pongas links en el caption: el link va en first_comment.
- Nada de "comentá X y te lo mando" ni engagement bait.
- Para carruseles: el caption es corto (4 a 8 líneas) y adelanta qué hay en las slides.
- Para posts de solo texto: más de 1.000 caracteres, párrafos de 1-2 líneas.

Reglas de las slides (formato 1080×1350, se leen en el celular):
- Una idea por slide. Títulos de máximo ~12 palabras; textos breves.
- Marcá entre **dobles asteriscos** la parte del título a destacar en color (una por título).
- Usá las cifras solo si están en la fuente provista o las verificaste con la
  búsqueda web; poné la fuente (medio + fecha) en el campo source.
- Nunca inventes datos, clientes, resultados ni URLs.`;

export interface GenerateLinkedInState {
  data?: LinkedInGenerated & { update?: UpdateTemplate };
  error?: string;
  usage?: { inputTokens: number; outputTokens: number };
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function generateLinkedInPost(
  _prev: GenerateLinkedInState,
  formData: FormData
): Promise<GenerateLinkedInState> {
  const type = str(formData, "type") as LinkedInPostType;
  const config = LINKEDIN_TYPES[type];
  if (!config) return { error: "Elegí un tipo de post." };

  const input = {
    post: str(formData, "source_post_id"),
    case: str(formData, "source_case_id"),
    url: str(formData, "source_url"),
    platform: str(formData, "platform"),
    notes: str(formData, "source_notes"),
  };
  const format = str(formData, "format") || config.defaultFormat;
  const profileId = str(formData, "publish_as_profile_id");

  const missing = config.required.filter((field) => !input[field]);
  if (missing.length > 0) {
    const names: Record<string, string> = {
      post: "la nota",
      case: "el caso",
      url: "la URL",
      platform: "la plataforma",
      notes: config.notesLabel.toLowerCase(),
    };
    return { error: `Para generar este tipo completá ${missing.map((m) => names[m]).join(", ")}.` };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "Falta configurar ANTHROPIC_API_KEY en el servidor para poder generar con IA." };
  }

  const supabase = await createClient();
  const context: string[] = [];

  if (input.post) {
    const { data: post } = await supabase
      .from("posts")
      .select("title, slug, excerpt, quick_answer, content")
      .eq("id", input.post)
      .maybeSingle();
    if (!post) return { error: "No se encontró la nota elegida." };
    const content = String(post.content ?? "").slice(0, 24000);
    context.push(
      `NOTA DEL BLOG\nTítulo: ${post.title}\nURL: ${SITE_URL}/blog/${post.slug}\nBajada: ${post.excerpt ?? ""}\nRespuesta rápida: ${post.quick_answer ?? ""}\n\nContenido:\n${content}`
    );
  }

  if (input.case) {
    const { data: c } = await supabase
      .from("success_cases")
      .select("client_name, title, description, metric_value, metric_label, service, link_url")
      .eq("id", input.case)
      .maybeSingle();
    if (c) {
      context.push(
        `CASO DE ÉXITO\nCliente: ${c.client_name}\nTítulo: ${c.title}\nDescripción: ${c.description ?? ""}\nResultado: ${c.metric_value ?? ""} ${c.metric_label ?? ""}\nServicio: ${c.service ?? ""}\nLink: ${c.link_url ?? ""}`
      );
    }
  }

  const newsItemId = str(formData, "news_item_id");
  if (newsItemId) {
    const { data: item } = await supabase
      .from("news_items")
      .select("title, summary, why_it_matters, ai_angle, source_url, source_name, published_date, related_links")
      .eq("id", newsItemId)
      .maybeSingle();
    if (item) {
      const related = ((item.related_links ?? []) as RelatedLink[])
        .map((l) => `- ${l.title} (${l.source}, ${l.type === "official" ? "oficial" : "referente"}): ${l.url}\n  ${l.summary}`)
        .join("\n");
      context.push(
        `NOVEDAD DEL RADAR\nTítulo: ${item.title}\nResumen: ${item.summary}\nPor qué importa: ${item.why_it_matters}\nÁngulo IA: ${item.ai_angle ?? "-"}\nFuente principal: ${item.source_name ?? ""} ${item.source_url}\nFecha: ${item.published_date ?? "-"}${related ? `\n\nREFERENTES SOBRE EL MISMO TEMA (usalos para sumar contexto, ejemplos y ángulos; citá datos solo si están ahí):\n${related}` : ""}`
      );
    }
  }

  if (input.platform) context.push(`PLATAFORMA: ${input.platform}`);
  if (input.url) context.push(`URL DE REFERENCIA: ${input.url}`);
  if (input.notes) context.push(`INDICACIONES / NOTAS DEL EQUIPO:\n${input.notes}`);

  let voice = "Publica la página de empresa de Crabsense (usá 'nosotros').";
  if (profileId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, public_title")
      .eq("id", profileId)
      .maybeSingle();
    if (profile?.full_name) {
      voice = `Publica ${profile.full_name}${profile.public_title ? ` (${profile.public_title})` : ""} desde su perfil personal: escribí en primera persona del singular.`;
    }
  }

  const formatInstruction =
    format === "text"
      ? "Formato: post de SOLO TEXTO (las slides son opcionales, seguí lo que diga la estructura)."
      : format === "image"
        ? "Formato: IMAGEN ÚNICA: devolvé exactamente 1 slide."
        : format === "image_carousel"
          ? "Formato: CARRUSEL DE IMÁGENES (varias imágenes en un mismo post de LinkedIn; cada slide se sube como una imagen 1080×1350)."
          : "Formato: CARRUSEL en PDF (documento de LinkedIn).";

  const userContent = `Generá un post de LinkedIn del tipo "${config.label}".
${voice}
${formatInstruction}

Estructura pedida:
${config.structure}

${type === "product_update" ? "" : `Figura de mármol sugerida para portada/cierre: ${config.defaultFigure}.\n`}${config.webSearch ? "Podés usar la búsqueda web para verificar datos y fechas; preferí fuentes oficiales." : "No tenés búsqueda web: usá solo la información provista."}
Escribí siempre en español rioplatense aunque las fuentes estén en inglés.

${context.join("\n\n---\n\n") || "(Sin fuente adicional.)"}`;

  try {
    const client = new Anthropic();
    const tools = config.webSearch
      ? { tools: [{ type: "web_search_20260318" as const, name: "web_search" as const, max_uses: 5 }] }
      : {};

    if (type === "product_update") {
      const response = await client.messages.parse({
        model: "claude-opus-5",
        max_tokens: 12000,
        system: SYSTEM_PROMPT,
        ...tools,
        messages: [{ role: "user", content: userContent }],
        output_config: { format: zodOutputFormat(linkedInUpdateGeneratedSchema) },
      });
      const out = response.parsed_output;
      if (!out) {
        return { error: "La IA no devolvió un resultado con el formato esperado. Probá de nuevo." };
      }
      return {
        data: {
          title: out.title,
          caption: out.caption,
          first_comment: out.first_comment,
          hashtags: out.hashtags,
          slides: [],
          update: normalizeUpdateTemplate(out.update, input.platform || "GA4"),
        },
        usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
      };
    }

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 12000,
      system: SYSTEM_PROMPT,
      ...tools,
      messages: [{ role: "user", content: userContent }],
      output_config: { format: zodOutputFormat(linkedInGeneratedSchema) },
    });

    if (!response.parsed_output) {
      return { error: "La IA no devolvió un resultado con el formato esperado. Probá de nuevo." };
    }
    return {
      data: response.parsed_output,
      usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido.";
    return { error: `No se pudo generar el post: ${message}` };
  }
}

// ---- Guardar ----

export interface LinkedInFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  try {
    return JSON.parse(String(value ?? "")) as T;
  } catch {
    return fallback;
  }
}

function parseFormData(formData: FormData) {
  return linkedInPostFormSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title") ?? "",
    format: formData.get("format"),
    source_post_id: formData.get("source_post_id") ?? "",
    source_case_id: formData.get("source_case_id") ?? "",
    source_url: formData.get("source_url") ?? "",
    platform: formData.get("platform") ?? "",
    source_notes: formData.get("source_notes") ?? "",
    caption: formData.get("caption") ?? "",
    first_comment: formData.get("first_comment") ?? "",
    hashtags: parseJson<string[]>(formData.get("hashtags"), []),
    slides: parseJson<unknown[]>(formData.get("slides"), []),
    style: formData.get("style") ?? "light",
    publish_as_profile_id: formData.get("publish_as_profile_id") ?? "",
    status: formData.get("status") ?? "draft",
    scheduled_for: formData.get("scheduled_for") ?? "",
    linkedin_url: formData.get("linkedin_url") ?? "",
    scheduled_time: formData.get("scheduled_time") ?? "",
    news_item_id: formData.get("news_item_id") ?? "",
    template_data: parseJson<unknown>(formData.get("template_data"), null),
  });
}

export async function createLinkedInPost(
  _prev: LinkedInFormState,
  formData: FormData
): Promise<LinkedInFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("linkedin_posts")
    .insert({
      ...parsed.data,
      published_at: parsed.data.status === "published" ? new Date().toISOString() : null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "No se pudo guardar el post." };

  if (parsed.data.news_item_id) {
    await supabase
      .from("news_items")
      .update({ status: "used", linkedin_post_id: data.id })
      .eq("id", parsed.data.news_item_id);
    revalidatePath("/admin/linkedin/radar");
  }

  revalidatePath("/admin/linkedin");
  revalidatePath("/admin/linkedin/calendario");
  redirect(`/admin/linkedin/${data.id}?saved=1`);
}

export async function updateLinkedInPost(
  id: string,
  _prev: LinkedInFormState,
  formData: FormData
): Promise<LinkedInFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("linkedin_posts")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();

  const publishedAt =
    parsed.data.status === "published"
      ? (current?.published_at ?? new Date().toISOString())
      : null;

  const { error } = await supabase
    .from("linkedin_posts")
    .update({ ...parsed.data, published_at: publishedAt })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/linkedin");
  revalidatePath("/admin/linkedin/calendario");
  revalidatePath(`/admin/linkedin/${id}`);
  return {};
}

export async function deleteLinkedInPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("linkedin_posts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/linkedin");
}
