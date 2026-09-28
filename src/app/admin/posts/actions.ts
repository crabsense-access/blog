"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { createClient } from "@/lib/supabase/server";
import { postFormSchema, postGenerateInputSchema } from "@/lib/validations/post";
import { postGeneratedContentSchema, type PostGeneratedContent } from "@/lib/post-ai-schema";
import { uploadPublicImage } from "@/lib/storage";

export interface GeneratePostContentState {
  data?: PostGeneratedContent;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

const POST_SYSTEM_PROMPT = `Sos un redactor experto en marketing digital y analítica web, escribiendo
notas para el blog de Crabsense (agencia de marketing digital especializada
en Google Analytics 4, Google Ads, Inteligencia Artificial aplicada a
marketing, y SEO). Escribís en español rioplatense, con tono profesional
pero directo, sin relleno ni frases genéricas.

Tenés una herramienta de búsqueda web: usala para encontrar estadísticas,
estudios y noticias reales y actuales sobre el tema antes de escribir.
Nunca inventes una cifra, un estudio o una URL -- si no encontrás un dato
concreto que respalde una afirmación, formulala de forma más general en vez
de inventar un número o una fuente. En la sección "Fuentes" del contenido,
incluí solamente URLs que hayan aparecido efectivamente en un resultado de
la búsqueda web durante esta conversación.

Te dan una categoría, una o dos subcategorías, un tema/idea para la nota, y
una lista de notas que ya existen en esa categoría. No repitas el mismo
ángulo que ya está cubierto por una de ellas. Generá una nota completa,
lista para revisar y publicar.`;

export async function generatePostContent(
  _prevState: GeneratePostContentState,
  formData: FormData
): Promise<GeneratePostContentState> {
  const parsed = postGenerateInputSchema.safeParse({
    topic: formData.get("topic"),
    category_id: formData.get("category_id"),
    subcategory_ids: formData.getAll("subcategory_ids").map(String),
  });

  if (!parsed.success) {
    return {
      error: "Completá el tema, la categoría principal y al menos una subcategoría antes de autocompletar.",
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      error:
        "Falta configurar ANTHROPIC_API_KEY en el servidor para poder usar el autocompletado con IA.",
    };
  }

  const { topic, category_id, subcategory_ids } = parsed.data;
  const supabase = await createClient();

  const [{ data: category }, { data: subcategories }, { data: existingPosts }] = await Promise.all([
    supabase.from("categories").select("name").eq("id", category_id).maybeSingle(),
    supabase.from("subcategories").select("name").in("id", subcategory_ids),
    supabase
      .from("posts")
      .select("title")
      .eq("category_id", category_id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!category) {
    return { error: "No se encontró la categoría elegida." };
  }

  const subcategoryNames = (subcategories ?? []).map((s) => s.name).join(", ") || "(ninguna)";
  const existingTitlesList =
    (existingPosts ?? []).map((p) => `- ${p.title}`).join("\n") ||
    "(ninguna nota todavía en esta categoría)";

  try {
    const client = new Anthropic();

    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      system: POST_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20260318",
          name: "web_search",
          max_uses: 6,
        },
      ],
      messages: [
        {
          role: "user",
          content: `Generá una nota de blog sobre "${topic}" para la categoría ${category.name} (subcategorías: ${subcategoryNames}).\n\nNotas ya publicadas en esta categoría (no repitas el mismo ángulo):\n${existingTitlesList}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(postGeneratedContentSchema),
      },
    });

    if (!response.parsed_output) {
      return { error: "La IA no devolvió un resultado con el formato esperado. Probá de nuevo." };
    }

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    return {
      data: response.parsed_output,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido.";
    return { error: `No se pudo generar el contenido: ${message}` };
  }
}

function parseFormData(formData: FormData) {
  const subcategoryIds = formData.getAll("subcategory_ids").map(String);
  const isFeatured = formData.get("is_featured") === "on";
  const isPopular = formData.get("is_popular") === "on";
  const featuredInSlider = formData.get("featured_in_slider") === "on";

  let faqs: unknown = [];
  try {
    faqs = JSON.parse(String(formData.get("faqs") ?? "[]"));
  } catch {
    faqs = [];
  }

  return postFormSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") ?? "",
    quick_answer: formData.get("quick_answer") ?? "",
    content: formData.get("content"),
    status: formData.get("status"),
    category_id: formData.get("category_id"),
    author_id: formData.get("author_id") ?? "",
    is_featured: isFeatured,
    is_popular: isPopular,
    featured_in_slider: featuredInSlider,
    subcategory_ids: subcategoryIds,
    meta_title: formData.get("meta_title") ?? "",
    meta_description: formData.get("meta_description") ?? "",
    canonical_url: formData.get("canonical_url") ?? "",
    faqs,
  });
}

export interface PostFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { subcategory_ids, author_id, is_featured, ...values } = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cover_image_url: string | undefined;
  const coverImageFile = formData.get("cover_image_file");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      cover_image_url = await uploadPublicImage(supabase, "post-covers", coverImageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen de portada: ${(e as Error).message}` };
    }
  }

  // Si es_featured es true, poner is_featured=false en todos los demás posts
  if (is_featured) {
    await supabase
      .from("posts")
      .update({ is_featured: false })
      .eq("is_featured", true);
  }

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      ...values,
      ...(cover_image_url ? { cover_image_url } : {}),
      author_id: author_id || user?.id || null,
      is_featured,
      published_at: values.status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { error: error?.message ?? "No se pudo crear la nota." };
  }

  if (subcategory_ids.length > 0) {
    await supabase
      .from("post_subcategories")
      .insert(subcategory_ids.map((subcategory_id) => ({ post_id: post.id, subcategory_id })));
  }

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
  revalidatePath("/");
  redirect("/admin/posts?saved=1");
}

export async function updatePost(
  id: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { subcategory_ids, author_id, is_featured, ...values } = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("posts")
    .select("status, published_at, slug")
    .eq("id", id)
    .maybeSingle();

  const published_at =
    values.status === "published"
      ? (current?.published_at ?? new Date().toISOString())
      : null;

  let cover_image_url: string | undefined;
  const coverImageFile = formData.get("cover_image_file");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    try {
      cover_image_url = await uploadPublicImage(supabase, "post-covers", coverImageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen de portada: ${(e as Error).message}` };
    }
  }

  // Si es_featured es true, poner is_featured=false en todos los demás posts
  if (is_featured) {
    await supabase
      .from("posts")
      .update({ is_featured: false })
      .neq("id", id)
      .eq("is_featured", true);
  }

  const { error } = await supabase
    .from("posts")
    .update({
      ...values,
      ...(cover_image_url ? { cover_image_url } : {}),
      author_id: author_id || null,
      published_at,
      is_featured,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("post_subcategories").delete().eq("post_id", id);
  if (subcategory_ids.length > 0) {
    await supabase
      .from("post_subcategories")
      .insert(subcategory_ids.map((subcategory_id) => ({ post_id: id, subcategory_id })));
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
  if (current?.slug && current.slug !== values.slug) {
    revalidatePath(`/blog/${current.slug}`);
  }
  revalidatePath("/");
  // A diferencia de createPost, acá no redirigimos: el pedido es quedarse
  // en la misma página de edición después de guardar (para poder seguir
  // editando sin volver a entrar desde la lista) — el toast de éxito lo
  // dispara post-form.tsx vía useSuccessToast al ver este estado "{}".
  return {};
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  if (existing?.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath("/");
}
