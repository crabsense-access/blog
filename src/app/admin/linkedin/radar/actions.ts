"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { findRelatedLinks, runRadarScan } from "@/lib/radar";
import { emptyUpdateTemplate } from "@/lib/linkedin-update";
import type { NewsItemStatus } from "@/lib/radar-types";

export interface RadarActionResult {
  ok: boolean;
  message?: string;
}

export async function scanNow(): Promise<RadarActionResult> {
  try {
    const supabase = await createClient();
    const { count } = await runRadarScan(supabase, "manual");
    revalidatePath("/admin/linkedin/radar");
    return { ok: true, message: `Listo: ${count} novedades nuevas.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "No se pudo buscar novedades." };
  }
}

export async function fetchRelated(itemId: string): Promise<RadarActionResult> {
  try {
    const supabase = await createClient();
    const links = await findRelatedLinks(supabase, itemId);
    revalidatePath("/admin/linkedin/radar");
    return { ok: true, message: `${links.length} referentes en total.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "No se pudieron buscar referentes." };
  }
}

export async function setNewsItemStatus(itemId: string, status: NewsItemStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("news_items").update({ status }).eq("id", itemId);
  if (error) throw error;
  revalidatePath("/admin/linkedin/radar");
}

/** Crea un borrador tipo II a partir de la novedad y abre el editor generando con IA. */
export async function createPostFromNews(itemId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: item, error } = await supabase
    .from("news_items")
    .select("id, platform, title, summary, why_it_matters, ai_angle, source_url, linkedin_post_id")
    .eq("id", itemId)
    .maybeSingle();
  if (error || !item) throw new Error(error?.message ?? "No se encontró la novedad.");

  if (item.linkedin_post_id) redirect(`/admin/linkedin/${item.linkedin_post_id}`);

  const { data: post, error: insErr } = await supabase
    .from("linkedin_posts")
    .insert({
      type: "product_update",
      title: item.title,
      format: "carousel",
      platform: item.platform,
      source_url: item.source_url,
      source_notes: [item.summary, item.why_it_matters, item.ai_angle].filter(Boolean).join("\n\n"),
      news_item_id: item.id,
      template_data: emptyUpdateTemplate(item.platform),
      status: "draft",
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (insErr || !post) throw new Error(insErr?.message ?? "No se pudo crear el post.");

  await supabase.from("news_items").update({ status: "used", linkedin_post_id: post.id }).eq("id", item.id);
  revalidatePath("/admin/linkedin");
  revalidatePath("/admin/linkedin/radar");
  redirect(`/admin/linkedin/${post.id}?generate=1`);
}
