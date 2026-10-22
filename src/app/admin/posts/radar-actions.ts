"use server";

import { revalidatePath } from "next/cache";

import { findRelatedLinks } from "@/lib/radar";
import type { RelatedLink } from "@/lib/radar-types";
import { createClient } from "@/lib/supabase/server";

export interface ReferencesResult {
  ok: boolean;
  links?: RelatedLink[];
  error?: string;
}

/** Busca con IA más referentes sobre la novedad y los suma a los que ya tenía. */
export async function searchMoreReferences(itemId: string): Promise<ReferencesResult> {
  try {
    const supabase = await createClient();
    const links = await findRelatedLinks(supabase, itemId);
    revalidatePath("/admin/linkedin/radar");
    return { ok: true, links };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudieron buscar referentes." };
  }
}

async function readLinks(itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_items")
    .select("source_url, related_links")
    .eq("id", itemId)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "No se encontró la novedad.");
  const links: RelatedLink[] = Array.isArray(data.related_links) ? data.related_links : [];
  return { supabase, links, sourceUrl: data.source_url as string };
}

async function saveLinks(itemId: string, links: RelatedLink[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("news_items").update({ related_links: links }).eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/linkedin/radar");
}

/** Agrega a mano un referente (URL + nota opcional de qué aporta). */
export async function addManualReference(itemId: string, rawUrl: string, note: string): Promise<ReferencesResult> {
  try {
    const value = rawUrl.trim();
    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    } catch {
      return { ok: false, error: "Pegá una URL válida." };
    }
    const href = url.toString();
    const { links, sourceUrl } = await readLinks(itemId);
    if (href === sourceUrl || links.some((l) => l.url === href)) {
      return { ok: false, error: "Ese link ya está en la lista." };
    }
    const host = url.hostname.replace(/^www\./, "");
    const next: RelatedLink[] = [
      ...links,
      {
        title: note.trim() ? note.trim().slice(0, 140) : host,
        url: href,
        source: host,
        type: "expert",
        summary: note.trim() || "Referente agregado a mano.",
        origin: "manual",
      },
    ];
    await saveLinks(itemId, next);
    return { ok: true, links: next };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo agregar el link." };
  }
}

/** Quita un referente de la novedad. */
export async function removeReference(itemId: string, url: string): Promise<ReferencesResult> {
  try {
    const { links } = await readLinks(itemId);
    const next = links.filter((l) => l.url !== url);
    await saveLinks(itemId, next);
    return { ok: true, links: next };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo quitar el link." };
  }
}
