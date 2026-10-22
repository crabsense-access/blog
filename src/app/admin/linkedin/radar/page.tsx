import { ExternalLinkIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SERVICE_COLORS } from "@/lib/linkedin-update";
import { getRadarScans, nextRadarRun } from "@/lib/queries/radar";
import { RELATED_ORIGIN_LABELS, type NewsItem } from "@/lib/radar-types";
import { cn } from "@/lib/utils";
import { LinkedInNav } from "../linkedin-nav";
import { CreatePostButton, DiscardButton, RelatedButton, ScanNowButton } from "./radar-buttons";

export const dynamic = "force-dynamic";
// La búsqueda con IA puede tardar 1–3 minutos (server action de esta página).
export const maxDuration = 300;

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const fmtDate = (d: string) =>
  new Date(`${d}T12:00:00`).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });

export default async function RadarPage() {
  let scans: Awaited<ReturnType<typeof getRadarScans>> = [];
  let loadError: string | null = null;
  try {
    scans = await getRadarScans();
  } catch (e) {
    loadError = (e as { message?: string })?.message ?? "Error desconocido";
  }
  const next = nextRadarRun();

  return (
    <div className="grid gap-6">
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">LinkedIn</h1>
        <LinkedInNav />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Cada 3 días la IA busca las 6 novedades más relevantes de GA4, Google Ads, Meta e Instagram Ads, SEO y
            GEO, priorizando fuentes oficiales y después referentes. Elegí una, sumá referentes y creá el post. Se muestran todas
            las búsquedas de los últimos 7 días.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Próxima búsqueda automática: {fmtDateTime(next.toISOString())}</p>
        </div>
        <ScanNowButton />
      </div>

      {loadError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          No se pudieron cargar las novedades: {loadError}. ¿Corriste la migración{" "}
          <code>20261005000000_linkedin_radar.sql</code>?
        </p>
      )}

      {!loadError && scans.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Todavía no hay búsquedas. Tocá “Buscar novedades ahora” para traer las primeras 6.
        </p>
      )}

      {scans.map(({ scan, items }) => (
        <section key={scan.id} className="grid gap-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Búsqueda del {fmtDateTime(scan.created_at)}
            </h2>
            <span className="text-xs text-muted-foreground">
              {scan.trigger === "cron" ? "automática" : "manual"}
              {scan.status === "running" && " · en curso…"}
              {scan.status === "error" && ` · error: ${scan.error}`}
              {scan.status === "done" && ` · ${items.length} novedades`}
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const svc = SERVICE_COLORS[item.service] ?? SERVICE_COLORS.analytics;
  const discarded = item.status === "discarded";
  return (
    <article className={cn("flex flex-col gap-3 rounded-lg border p-4", discarded && "opacity-50")}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-full border-2 bg-white px-2.5 py-0.5 text-[11px] font-bold uppercase"
          style={{ borderColor: svc.light, color: svc.light }}
        >
          {item.platform}
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase text-white"
          style={{ background: svc.light }}
        >
          Novedades
        </span>
        {item.ai_angle && (
          <Badge variant="secondary" className="gap-1">
            <SparklesIcon className="size-3" /> IA
          </Badge>
        )}
        {item.status === "used" && <Badge>En uso</Badge>}
        <span className="ml-auto text-xs tabular-nums text-muted-foreground" title="Relevancia">
          {"●".repeat(item.relevance)}
          <span className="opacity-30">{"●".repeat(5 - item.relevance)}</span>
        </span>
      </div>

      <h3 className="text-base font-semibold leading-snug text-balance">{item.title}</h3>
      <p className="text-sm">{item.summary}</p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Por qué importa: </span>
        {item.why_it_matters}
      </p>
      {item.ai_angle && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Ángulo IA: </span>
          {item.ai_angle}
        </p>
      )}

      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-[#53539b] hover:underline"
      >
        <ExternalLinkIcon className="size-3.5 flex-none" />
        <span className="truncate">{item.source_name ?? item.source_url}</span>
        <Badge variant="outline" className="ml-1 flex-none">
          {item.source_type === "official" ? "Oficial" : "Referente"}
        </Badge>
        {item.published_date && <span className="flex-none text-xs text-muted-foreground">· {fmtDate(item.published_date)}</span>}
      </a>

      {item.related_links.length > 0 && (
        <div className="grid gap-2 rounded-md bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Referentes sobre el tema</p>
          <ul className="grid gap-2">
            {item.related_links.map((l) => (
              <li key={l.url} className="text-sm">
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  {l.title}
                </a>{" "}
                <span className="text-xs text-muted-foreground">
                  · {l.source} {l.type === "official" ? "(oficial)" : ""}
                  {l.origin ? ` · ${RELATED_ORIGIN_LABELS[l.origin]}` : ""}
                </span>
                <p className="text-xs text-muted-foreground">{l.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <CreatePostButton itemId={item.id} existingPostId={item.linkedin_post_id} />
        <RelatedButton itemId={item.id} hasLinks={item.related_links.length > 0} />
        {item.status !== "used" && <DiscardButton itemId={item.id} discarded={discarded} />}
      </div>
    </article>
  );
}
