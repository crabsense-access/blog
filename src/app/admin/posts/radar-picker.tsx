"use client";

import { useState, useTransition } from "react";
import { ExternalLinkIcon, Loader2Icon, PlusIcon, RadarIcon, SearchIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_COLORS } from "@/lib/linkedin-update";
import { RELATED_ORIGIN_LABELS, type NewsItem, type RelatedLink } from "@/lib/radar-types";
import { cn } from "@/lib/utils";
import { addManualReference, removeReference, searchMoreReferences } from "./radar-actions";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric",
    month: "short",
  });

function ServicePill({ item }: { item: NewsItem }) {
  const svc = SERVICE_COLORS[item.service] ?? SERVICE_COLORS.analytics;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border-2 bg-white px-2 py-px text-[10px] font-bold uppercase"
      style={{ borderColor: svc.light, color: svc.light }}
    >
      {item.platform}
    </span>
  );
}

/**
 * Paso 1 de "Nueva nota": elegir una novedad del radar (últimos 7 días) y
 * sumarle referentes (con IA o a mano). La novedad elegida y sus referentes
 * viajan a "Autocompletar con IA" como contexto de la nota.
 */
export function RadarPicker({
  items,
  selectedId,
  links,
  onSelect,
  onLinksChange,
}: {
  items: NewsItem[];
  selectedId: string | null;
  links: RelatedLink[];
  onSelect: (item: NewsItem | null) => void;
  onLinksChange: (links: RelatedLink[]) => void;
}) {
  const [searching, startSearch] = useTransition();
  const [adding, startAdd] = useTransition();
  const [manualUrl, setManualUrl] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No hay novedades del radar de los últimos 7 días. Podés buscarlas en LinkedIn › Radar de novedades, o
        escribir el tema de la nota a mano más abajo.
      </p>
    );
  }

  if (!selected) {
    return (
      <div className="grid max-h-96 gap-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setError(null);
              setInfo(null);
              onSelect(item);
            }}
            className="grid gap-1 rounded-md border p-3 text-left transition-colors hover:border-foreground/30 hover:bg-muted/40"
          >
            <span className="flex items-center gap-2">
              <ServicePill item={item} />
              <span className="text-xs text-muted-foreground">{fmtDate(item.created_at)}</span>
              {item.related_links.length > 0 && (
                <span className="text-xs text-muted-foreground">· {item.related_links.length} referentes</span>
              )}
              <span className="ml-auto text-xs tabular-nums text-muted-foreground" title="Relevancia">
                {"●".repeat(item.relevance)}
                <span className="opacity-30">{"●".repeat(5 - item.relevance)}</span>
              </span>
            </span>
            <span className="text-sm font-medium leading-snug">{item.title}</span>
            <span className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 rounded-md border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="grid flex-1 gap-1.5">
          <span className="flex items-center gap-2">
            <ServicePill item={selected} />
            <span className="text-xs text-muted-foreground">{fmtDate(selected.created_at)}</span>
          </span>
          <p className="text-sm font-semibold leading-snug">{selected.title}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onSelect(null)}>
          Cambiar
        </Button>
      </div>

      <p className="text-sm">{selected.summary}</p>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Por qué importa: </span>
        {selected.why_it_matters}
      </p>
      {selected.ai_angle && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Ángulo IA: </span>
          {selected.ai_angle}
        </p>
      )}

      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fuentes ({links.length + 1})
        </p>
        <ul className="grid gap-2">
          <li className="flex items-start gap-2 text-sm">
            <ExternalLinkIcon className="mt-0.5 size-3.5 flex-none text-muted-foreground" />
            <div className="grid flex-1 gap-0.5">
              <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {selected.source_name ?? selected.source_url}
              </a>
              <span className="text-xs text-muted-foreground">Fuente principal</span>
            </div>
            <Badge variant="secondary">{selected.source_type === "official" ? "Oficial" : "Referente"}</Badge>
          </li>
          {links.map((l) => (
            <li key={l.url} className="flex items-start gap-2 text-sm">
              <ExternalLinkIcon className="mt-0.5 size-3.5 flex-none text-muted-foreground" />
              <div className="grid flex-1 gap-0.5">
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {l.title}
                </a>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {l.origin ? `${RELATED_ORIGIN_LABELS[l.origin]} · ` : ""}
                  {l.source} · {l.summary}
                </span>
              </div>
              <Badge variant={l.type === "official" ? "secondary" : "outline"}>
                {l.type === "official" ? "Oficial" : "Referente"}
              </Badge>
              <button
                type="button"
                aria-label="Quitar referente"
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() =>
                  startAdd(async () => {
                    const res = await removeReference(selected.id, l.url);
                    if (res.ok && res.links) onLinksChange(res.links);
                    else setError(res.error ?? null);
                  })
                }
              >
                <XIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2">
        <p className="text-xs text-muted-foreground">
          Busca el título de la novedad tal cual desde Argentina y traducido al inglés, y suma los 3 primeros
          resultados de cada búsqueda (búsqueda web de la IA: aproximada a Google).
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={searching}
          onClick={() => {
            setError(null);
            setInfo(null);
            startSearch(async () => {
              const before = links.length;
              const res = await searchMoreReferences(selected.id);
              if (res.ok && res.links) {
                onLinksChange(res.links);
                const added = res.links.length - before;
                setInfo(added > 0 ? `Se sumaron ${added} referentes.` : "No aparecieron referentes nuevos.");
              } else setError(res.error ?? "No se pudieron buscar referentes.");
            });
          }}
        >
          {searching ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
          {searching
            ? "Buscando en Google AR + EN… (≈1 min)"
            : links.length
              ? "Buscar más referentes (Google AR + EN)"
              : "Buscar referentes (Google AR + EN)"}
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Pegá un link que quieras sumar"
            inputMode="url"
            className="sm:flex-1"
          />
          <Input
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            placeholder="Qué aporta (opcional)"
            className="sm:flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            disabled={adding || manualUrl.trim().length < 4}
            onClick={() => {
              setError(null);
              setInfo(null);
              startAdd(async () => {
                const res = await addManualReference(selected.id, manualUrl, manualNote);
                if (res.ok && res.links) {
                  onLinksChange(res.links);
                  setManualUrl("");
                  setManualNote("");
                } else setError(res.error ?? "No se pudo agregar el link.");
              });
            }}
          >
            {adding ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
            Agregar
          </Button>
        </div>
        {info && <p className="text-xs text-muted-foreground">{info}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}

export function RadarPickerHeading() {
  return (
    <p className={cn("flex items-center gap-2 text-sm font-semibold")}>
      <RadarIcon className="size-4" /> 1 · Elegí una novedad del radar
    </p>
  );
}
