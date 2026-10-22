import { createClient } from "@/lib/supabase/server";
import type { NewsItem, NewsScan } from "@/lib/radar-types";

/**
 * Escaneos de los últimos `days` días con sus novedades (más recientes
 * primero). Nada se borra de la base: los más viejos solo dejan de mostrarse.
 * Si no hubo búsquedas en ese período, muestra al menos la última.
 */
export async function getRadarScans(days = 7): Promise<{ scan: NewsScan; items: NewsItem[] }[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  const { data: recentScans, error } = await supabase
    .from("news_scans")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  if (error) throw error;

  let scans = recentScans ?? [];
  if (!scans.length) {
    const { data: last, error: lastError } = await supabase
      .from("news_scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);
    if (lastError) throw lastError;
    scans = last ?? [];
  }
  if (!scans.length) return [];

  const { data: items, error: itemsError } = await supabase
    .from("news_items")
    .select("*")
    .in(
      "scan_id",
      scans.map((s) => s.id)
    )
    .order("relevance", { ascending: false });
  if (itemsError) throw itemsError;

  return (scans as NewsScan[]).map((scan) => ({
    scan,
    items: ((items ?? []) as NewsItem[])
      .filter((i) => i.scan_id === scan.id)
      .map((i) => ({ ...i, related_links: Array.isArray(i.related_links) ? i.related_links : [] })),
  }));
}

// Próxima ejecución del cron de vercel.json: días 1, 4, 7… del mes a las 11:00 UTC.
export function nextRadarRun(from = new Date()): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 11));
  for (let i = 0; i < 40; i++) {
    const day = d.getUTCDate();
    if ((day - 1) % 3 === 0 && d > from) return d;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return d;
}

/**
 * Novedades de los últimos `days` días (sin las descartadas), para elegir
 * una como punto de partida de una nota del blog. Más nuevas primero.
 */
export async function getRecentNewsItems(days = 7): Promise<NewsItem[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("news_items")
    .select("*")
    .gte("created_at", since)
    .neq("status", "discarded")
    .order("created_at", { ascending: false })
    .order("relevance", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as NewsItem[]).map((i) => ({
    ...i,
    related_links: Array.isArray(i.related_links) ? i.related_links : [],
  }));
}
