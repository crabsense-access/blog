"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { createClient } from "@/lib/supabase/server";
import { isGlossarySlugTaken } from "@/lib/queries/glossary";
import {
  glossaryGenerateInputSchema,
  glossaryTermFormSchema,
  GLOSSARY_CATEGORY_LABELS,
} from "@/lib/validations/glossary";
import { glossaryGeneratedContentSchema, type GlossaryGeneratedContent } from "@/lib/glossary-ai-schema";

export interface GenerateGlossaryContentState {
  data?: GlossaryGeneratedContent;
  error?: string;
}

const SYSTEM_PROMPT = `Sos un redactor experto en marketing digital y analítica web, escribiendo\npara un glosario técnico en español rioplatense sobre Google Analytics 4,\nGoogle Ads, Inteligencia Artificial aplicada a marketing, y SEO.\n\nTe dan un término y su categoría. Generá el contenido completo del\nglosario para ese término, evaluando vos mismo (según el término y la\ncategoría) si corresponde marcarlo como métrica con fórmula y si amerita\nuna tabla comparativa contra un término con el que se confunde.\n\nTono profesional pero directo, sin relleno ni frases genéricas. Todo el\ntexto en español.`;

export async function generateGlossaryTermContent(
  _prevState: GenerateGlossaryContentState,
  formData: FormData
): Promise<GenerateGlossaryContentState> {
  const parsed = glossaryGenerateInputSchema.safeParse({
    term: formData.get("term"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: "Completá el término y la categoría antes de autocompletar." };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error:
        "Falta configurar ANTHROPIC_API_KEY en el servidor para poder usar el autocompletado con IA.",
    };
  }

  const { term, category } = parsed.data;
  const categoryLabel = GLOSSARY_CATEGORY_LABELS[category];

  try {
    const client = new Anthropic();

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generá el contenido de glosario para el término "${term}" de la categoría ${categoryLabel} (${category}).`,
        },
      ],
      output_config: {
        format: zodOutputFormat(glossaryGeneratedContentSchema),
      },
    });

    if (!response.parsed_output) {
      return { error: "La IA no devolvió un resultado con el formato esperado. Probá de nuevo." };
    }

    return { data: response.parsed_output };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido.";
    return { error: `No se pudo generar el contenido: ${message}` };
  }
}

export interface GlossaryTermFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseFormData(formData: FormData) {
  let formula: unknown = null;
  try {
    const raw = formData.get("formula");
    formula = raw ? JSON.parse(String(raw)) : null;
  } catch {
    formula = null;
  }

  let comparisonTable: unknown = null;
  try {
    const raw = formData.get("comparison_table");
    comparisonTable = raw ? JSON.parse(String(raw)) : null;
  } catch {
    comparisonTable = null;
  }

  let relatedTerms: unknown = [];
  try {
    relatedTerms = JSON.parse(String(formData.get("related_terms") ?? "[]"));
  } catch {
    relatedTerms = [];
  }

  let faqs: unknown = [];
  try {
    faqs = JSON.parse(String(formData.get("faqs") ?? "[]"));
  } catch {
    faqs = [];
  }

  return glossaryTermFormSchema.safeParse({
    term: formData.get("term"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    quick_answer: formData.get("quick_answer") ?? "",
    has_formula: formData.get("has_formula") === "on",
    formula,
    extended_explanation: formData.get("extended_explanation") ?? "",
    example: formData.get("example") ?? "",
    comparison_table: comparisonTable,
    related_terms: relatedTerms,
    faqs,
    author_id: formData.get("author_id") ?? "",
    status: formData.get("status"),
  });
}

export async function createGlossaryTerm(
  _prevState: GlossaryTermFormState,
  formData: FormData
): Promise<GlossaryTermFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { author_id, ...values } = parsed.data;

  if (await isGlossarySlugTaken(values.category, values.slug)) {
    return { fieldErrors: { slug: ["Ya existe un término con ese slug en esta categoría."] } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("glossary_terms").insert({
    ...values,
    author_id: author_id || user?.id || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/glosario");
  revalidatePath(`/glosario/${values.category}`);
  revalidatePath(`/glosario/${values.category}/${values.slug}`);
  revalidatePath("/glosario");
  return {};
}

export async function updateGlossaryTerm(
  id: string,
  _prevState: GlossaryTermFormState,
  formData: FormData
): Promise<GlossaryTermFormState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { author_id, ...values } = parsed.data;

  if (await isGlossarySlugTaken(values.category, values.slug, id)) {
    return { fieldErrors: { slug: ["Ya existe un término con ese slug en esta categoría."] } };
  }

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("glossary_terms")
    .select("category, slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("glossary_terms")
    .update({
      ...values,
      author_id: author_id || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/glosario");
  revalidatePath(`/admin/glosario/${id}`);
  revalidatePath(`/glosario/${values.category}`);
  revalidatePath(`/glosario/${values.category}/${values.slug}`);
  if (current && (current.category !== values.category || current.slug !== values.slug)) {
    revalidatePath(`/glosario/${current.category}/${current.slug}`);
  }
  revalidatePath("/glosario");
  return {};
}

export async function deleteGlossaryTerm(id: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("glossary_terms")
    .select("category, slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("glossary_terms").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/glosario");
  if (existing) {
    revalidatePath(`/glosario/${existing.category}`);
    revalidatePath(`/glosario/${existing.category}/${existing.slug}`);
  }
  revalidatePath("/glosario");
}
