// Radar de novedades: búsqueda con IA (Claude + búsqueda web) de las 6
// novedades más relevantes de GA4, Google Ads, Meta/Instagram Ads, SEO y GEO,
// y búsqueda de referentes sobre una novedad elegida. Solo servidor.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { radarScanSchema, serpLinksSchema } from "@/lib/radar-ai-schema";
import type { RelatedLink } from "@/lib/radar-types";

const MODEL = "claude-opus-5";

export const RADAR_SOURCES = `FUENTES OFICIALES (prioridad 1, siempre buscá primero acá):
- GA4: support.google.com/analytics (página "What's new in Google Analytics" / "Novedades"), developers.google.com/analytics (release notes), blog.google (Analytics).
- Google Ads: support.google.com/google-ads/announcements, blog.google/products/ads-commerce, ads-developers.googleblog.com, Google Ads Liaison (Ginny Marvin).
- Meta Ads e Instagram Ads: facebook.com/business/news, developers.facebook.com/blog y changelog de Marketing API, about.fb.com/news, business.instagram.com/blog, about.instagram.com/blog.
- SEO: developers.google.com/search/blog (Google Search Central), developers.google.com/search/updates (changelog de documentación), status.search.google.com (core updates), blogs.bing.com/webmaster.
- GEO / búsqueda con IA: blog.google (AI Overviews, AI Mode), openai.com/news (ChatGPT search), perplexity.ai/hub/blog, anthropic.com/news, Bing/Copilot.

REFERENTES (prioridad 2, para confirmar, sumar contexto o cubrir lo que no tiene anuncio oficial):
- Analytics: Simo Ahava, Julius Fedorovicius (Analytics Mania), Krista Seiden, Charles Farina, Measure School, Loves Data (Benjamin Mangold).
- Ads: PPC Land, Search Engine Land (sección PPC), Jon Loomer (Meta), Social Media Today, Navah Hopkins, Frederick Vallaeys.
- SEO y GEO: Search Engine Land, Search Engine Roundtable (Barry Schwartz), Search Engine Journal, Aleyda Solis, Lily Ray, Glenn Gabe, Marie Haynes, Kevin Indig, Mike King (iPullRank).
Preferí fuentes en inglés; las de español también valen.`;

const SCAN_SYSTEM = `Sos el analista de novedades de Crabsense, agencia de marketing digital
especializada en GA4, SEO/GEO, Google Ads, Meta Ads e IA aplicada a marketing.
Tu trabajo: encontrar con la búsqueda web las novedades REALES y RECIENTES de las
herramientas que usa la agencia, para convertirlas en posts de LinkedIn.

${RADAR_SOURCES}

Reglas:
- Solo novedades anunciadas en los últimos 14 días (si no hay suficientes, hasta 30 días). Nada de guías genéricas ni noticias viejas.
- Cada novedad tiene que estar respaldada por una URL que apareció en tus resultados de búsqueda. Nunca inventes URLs, fechas ni funciones.
- Mix de las 6: al menos una de GA4, una de Google Ads, una de Meta o Instagram Ads, una de SEO y una de GEO; la sexta, la más relevante que quede.
- Priorizá las que tengan relación con IA (funciones con IA, automatización, AI Overviews, LLMs) y las que obligan a hacer algo (deprecaciones, cambios de políticas, fechas límite).
- No repitas novedades de la lista de "ya reportadas".
- Todo el texto en español rioplatense, aunque la fuente esté en inglés.`;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Descarta URLs que devuelven 404/410 (algunos sitios bloquean bots: 403 se acepta). */
async function urlLooksAlive(url: string): Promise<boolean> {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (CrabsenseRadar)" } });
    clearTimeout(t);
    return res.status !== 404 && res.status !== 410;
  } catch {
    // timeout o error de red: no lo descartamos por eso
    return true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

export async function runRadarScan(supabase: AnyClient, trigger: "cron" | "manual") {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Falta ANTHROPIC_API_KEY en el servidor.");

  const { data: scan, error: scanError } = await supabase
    .from("news_scans")
    .insert({ trigger, status: "running" })
    .select("id")
    .single();
  if (scanError || !scan) throw new Error(scanError?.message ?? "No se pudo crear el escaneo.");

  try {
    const since = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("news_items")
      .select("title, source_url")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(80);
    const already = (recent ?? []).map((r) => `- ${r.title} (${r.source_url})`).join("\n") || "(ninguna)";

    // 3 búsquedas en paralelo (2 plataformas cada una) para que todo el
    // escaneo entre en el límite de 300 s de Vercel; en serie tardaba ~4,5 min.
    const client = new Anthropic();
    const groups: [string, string][] = [
      ["GA4", "Google Ads"],
      ["Meta Ads", "Instagram Ads"],
      ["SEO", "GEO"],
    ];
    const responses = await Promise.all(
      groups.map(([a, b]) =>
        client.messages.parse({
          model: MODEL,
          max_tokens: 6000,
          system: SCAN_SYSTEM,
          tools: [{ type: "web_search_20260318", name: "web_search", max_uses: 6 }],
          messages: [
            {
              role: "user",
              content: `Hoy es ${todayISO()}. En esta búsqueda ocupate SOLO de ${a} y ${b}: devolvé exactamente 2 novedades, una de ${a} y una de ${b} (si una no tiene novedades reales recientes, las 2 de la otra). Ignorá la regla del mix de 6: las otras plataformas las cubren otras búsquedas.\n\nYa reportadas (no repetir):\n${already}`,
            },
          ],
          output_config: { format: zodOutputFormat(radarScanSchema) },
        })
      )
    );
    const response = {
      usage: {
        input_tokens: responses.reduce((n, r) => n + r.usage.input_tokens, 0),
        output_tokens: responses.reduce((n, r) => n + r.usage.output_tokens, 0),
      },
    };
    const seen = new Set<string>();
    const items = responses
      .flatMap((r) => (r.parsed_output?.items ?? []).slice(0, 2))
      .filter((it) => (seen.has(it.source_url) ? false : (seen.add(it.source_url), true)));
    const checked = await Promise.all(items.map(async (it) => ((await urlLooksAlive(it.source_url)) ? it : null)));
    const valid = checked.filter((it): it is NonNullable<typeof it> => it !== null);

    if (valid.length > 0) {
      const { error } = await supabase.from("news_items").upsert(
        valid.map((it) => ({
          scan_id: scan.id,
          platform: it.platform,
          service: it.service,
          title: it.title,
          summary: it.summary,
          why_it_matters: it.why_it_matters,
          ai_angle: it.ai_angle,
          source_url: it.source_url,
          source_name: it.source_name,
          source_type: it.source_type,
          source_language: it.source_language,
          published_date: it.published_date && /^\d{4}-\d{2}-\d{2}$/.test(it.published_date) ? it.published_date : null,
          relevance: it.relevance,
        })),
        { onConflict: "source_url", ignoreDuplicates: true }
      );
      if (error) throw new Error(error.message);
    }

    await supabase
      .from("news_scans")
      .update({
        status: "done",
        finished_at: new Date().toISOString(),
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      })
      .eq("id", scan.id);

    return { scanId: scan.id as string, count: valid.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido";
    await supabase
      .from("news_scans")
      .update({ status: "error", error: message, finished_at: new Date().toISOString() })
      .eq("id", scan.id);
    throw e;
  }
}

const SERP_SYSTEM = `Sos el investigador de Crabsense. Simulás una búsqueda de Google: hacés UNA sola
búsqueda web con la consulta que te indican, tal cual, y devolvés los primeros
resultados en el MISMO ORDEN en que aparecieron.

Reglas:
- Exactamente una búsqueda, con la consulta indicada (no la reformules ni agregues palabras).
- Devolvé los primeros 3 resultados orgánicos en orden, salteando solo las URLs que te digan que ya tenemos.
- Solo URLs que aparecieron en los resultados. Nunca inventes URLs.
- Resumí cada resultado en español en 1 o 2 frases (qué dice y qué aporta sobre el tema).`;

/**
 * Referentes de una novedad, "estilo Google":
 * 1) el título tal cual, buscado desde Argentina → primeros 3 resultados;
 * 2) el título traducido al inglés, buscado en inglés → primeros 3 resultados.
 * Usa la búsqueda web de la IA con ubicación AR / US: es una aproximación a
 * Google (no son exactamente los mismos resultados ni el mismo orden).
 * Se SUMAN a los referentes que ya tenía la novedad, sin repetir URLs.
 */
export async function findRelatedLinks(supabase: AnyClient, itemId: string): Promise<RelatedLink[]> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("Falta ANTHROPIC_API_KEY en el servidor.");
  const { data: item, error } = await supabase
    .from("news_items")
    .select("title, source_url, related_links")
    .eq("id", itemId)
    .maybeSingle();
  if (error || !item) throw new Error(error?.message ?? "No se encontró la novedad.");

  const existing: RelatedLink[] = Array.isArray(item.related_links) ? item.related_links : [];
  const existingUrls = new Set<string>([item.source_url, ...existing.map((l) => l.url)]);
  const skipList = [...existingUrls].map((u) => `- ${u}`).join("\n");

  const client = new Anthropic();
  const search = (country: "AR" | "US", content: string) =>
    client.messages.parse({
      model: MODEL,
      max_tokens: 3000,
      system: SERP_SYSTEM,
      tools: [
        {
          type: "web_search_20260318",
          name: "web_search",
          max_uses: 1,
          user_location:
            country === "AR"
              ? { type: "approximate", country: "AR", city: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires" }
              : { type: "approximate", country: "US", timezone: "America/New_York" },
        },
      ],
      messages: [{ role: "user", content }],
      output_config: { format: zodOutputFormat(serpLinksSchema) },
    });

  const skip = `\n\nURLs que ya tenemos (salteálas y seguí con el próximo resultado):\n${skipList}`;
  const [ar, en] = await Promise.all([
    search("AR", `Buscá exactamente esta consulta (en español, desde Argentina):\n${item.title}${skip}`),
    search(
      "US",
      `Traducí al inglés este título y buscá exactamente esa traducción (búsqueda en inglés):\n${item.title}${skip}`
    ),
  ]);

  const found: RelatedLink[] = [];
  const take = (res: typeof ar, origin: "google_ar" | "google_en") => {
    for (const r of (res.parsed_output?.results ?? []).slice(0, 3)) {
      if (existingUrls.has(r.url)) continue;
      existingUrls.add(r.url);
      found.push({ ...r, origin });
    }
  };
  take(ar, "google_ar");
  take(en, "google_en");

  const checked = await Promise.all(found.map(async (l) => ((await urlLooksAlive(l.url)) ? l : null)));
  const merged = [...existing, ...checked.filter((l): l is RelatedLink => l !== null)];

  const { error: upErr } = await supabase
    .from("news_items")
    .update({ related_links: merged, related_fetched_at: new Date().toISOString() })
    .eq("id", itemId);
  if (upErr) throw new Error(upErr.message);
  return merged;
}
