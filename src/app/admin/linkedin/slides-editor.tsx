"use client";

import { ArrowDownIcon, ArrowUpIcon, CopyIcon, PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FIGURE_OPTIONS,
  SLIDE_KIND_LABELS,
  emptySlide,
  toRoman,
  type LinkedInSlide,
  type SlideFigure,
  type SlideKind,
} from "@/lib/linkedin";

export const selectClass =
  "border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30";

interface SlidesEditorProps {
  slides: LinkedInSlide[];
  onChange: (slides: LinkedInSlide[]) => void;
  onSelect?: (index: number) => void;
}

export function SlidesEditor({ slides, onChange, onSelect }: SlidesEditorProps) {
  function update(index: number, patch: Partial<LinkedInSlide>) {
    onChange(slides.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    onSelect?.(target);
  }
  function remove(index: number) {
    onChange(slides.filter((_, i) => i !== index));
  }
  function duplicate(index: number) {
    const next = [...slides];
    next.splice(index + 1, 0, structuredClone(slides[index]));
    onChange(next);
  }
  function add() {
    onChange([...slides, emptySlide("text")]);
    onSelect?.(slides.length);
  }

  return (
    <div className="grid gap-4">
      {slides.length === 0 && (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Todavía no hay slides. Generalas con IA o agregá la primera a mano.
        </p>
      )}

      {slides.map((slide, i) => (
        <div
          key={i}
          className="grid gap-3 rounded-lg border p-4"
          onFocusCapture={() => onSelect?.(i)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-10 text-sm font-semibold tracking-wider text-muted-foreground">
              {toRoman(i + 1)}
            </span>
            <select
              aria-label="Tipo de slide"
              className={`${selectClass} w-auto`}
              value={slide.kind}
              onChange={(e) => update(i, { kind: e.target.value as SlideKind })}
            >
              {Object.entries(SLIDE_KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="Figura"
              className={`${selectClass} w-auto`}
              value={slide.figure}
              onChange={(e) => update(i, { figure: e.target.value as SlideFigure })}
            >
              {FIGURE_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <div className="ml-auto flex gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label="Subir" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUpIcon />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Bajar" onClick={() => move(i, 1)} disabled={i === slides.length - 1}>
                <ArrowDownIcon />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Duplicar" onClick={() => duplicate(i)}>
                <CopyIcon />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Eliminar" onClick={() => remove(i)}>
                <TrashIcon />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
            <Field label="Etiqueta (eyebrow)">
              <Input value={slide.eyebrow} onChange={(e) => update(i, { eyebrow: e.target.value })} />
            </Field>
            <Field label="Título — **texto** = destacado">
              <Input value={slide.title} onChange={(e) => update(i, { title: e.target.value })} />
            </Field>
          </div>

          {slide.kind === "stat" && (
            <Field label="Cifra grande">
              <Input value={slide.value} placeholder="17%" onChange={(e) => update(i, { value: e.target.value })} />
            </Field>
          )}

          {slide.kind !== "compare" && (
            <Field label="Texto">
              <Textarea rows={2} value={slide.body} onChange={(e) => update(i, { body: e.target.value })} />
            </Field>
          )}

          {slide.kind === "list" && (
            <div className="grid gap-2">
              <div className="flex items-center gap-3">
                <Label className="text-xs">Items</Label>
                <select
                  aria-label="Marcador de la lista"
                  className={`${selectClass} h-8 w-auto text-xs`}
                  value={slide.list_style}
                  onChange={(e) => update(i, { list_style: e.target.value as LinkedInSlide["list_style"] })}
                >
                  <option value="roman">Numerada (I, II, III)</option>
                  <option value="check">Checks ✓</option>
                  <option value="cross">Errores ✕</option>
                </select>
              </div>
              {slide.items.map((item, j) => (
                <div key={j} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                  <Input
                    aria-label="Título del item"
                    value={item.title}
                    placeholder="Título"
                    onChange={(e) =>
                      update(i, { items: slide.items.map((it, k) => (k === j ? { ...it, title: e.target.value } : it)) })
                    }
                  />
                  <Input
                    aria-label="Descripción del item"
                    value={item.description}
                    placeholder="Descripción"
                    onChange={(e) =>
                      update(i, {
                        items: slide.items.map((it, k) => (k === j ? { ...it, description: e.target.value } : it)),
                      })
                    }
                  />
                  <Button type="button" variant="ghost" size="icon" aria-label="Quitar item" onClick={() => update(i, { items: slide.items.filter((_, k) => k !== j) })}>
                    <TrashIcon />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => update(i, { items: [...slide.items, { title: "", description: "" }] })}>
                <PlusIcon /> Item
              </Button>
            </div>
          )}

          {slide.kind === "stat" && (
            <div className="grid gap-2">
              <Label className="text-xs">Barras de comparación (valor 0–100 = largo de la barra)</Label>
              {slide.bars.map((bar, j) => (
                <div key={j} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2">
                  <Input
                    aria-label="Etiqueta de la barra"
                    value={bar.label}
                    placeholder="Febrero 2026"
                    onChange={(e) => update(i, { bars: slide.bars.map((b, k) => (k === j ? { ...b, label: e.target.value } : b)) })}
                  />
                  <Input
                    aria-label="Largo de la barra"
                    type="number"
                    min={0}
                    max={100}
                    value={bar.value}
                    onChange={(e) => update(i, { bars: slide.bars.map((b, k) => (k === j ? { ...b, value: Number(e.target.value) } : b)) })}
                  />
                  <Input
                    aria-label="Texto de la barra"
                    value={bar.display}
                    placeholder="17%"
                    onChange={(e) => update(i, { bars: slide.bars.map((b, k) => (k === j ? { ...b, display: e.target.value } : b)) })}
                  />
                  <Button type="button" variant="ghost" size="icon" aria-label="Quitar barra" onClick={() => update(i, { bars: slide.bars.filter((_, k) => k !== j) })}>
                    <TrashIcon />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => update(i, { bars: [...slide.bars, { label: "", value: 50, display: "" }] })}>
                <PlusIcon /> Barra
              </Button>
            </div>
          )}

          {slide.kind === "compare" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Field label="Etiqueta izquierda">
                  <Input value={slide.left_label} placeholder="Antes / Mito" onChange={(e) => update(i, { left_label: e.target.value })} />
                </Field>
                <Textarea rows={3} aria-label="Texto izquierdo" value={slide.left_body} onChange={(e) => update(i, { left_body: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Field label="Etiqueta derecha">
                  <Input value={slide.right_label} placeholder="Después / Realidad" onChange={(e) => update(i, { right_label: e.target.value })} />
                </Field>
                <Textarea rows={3} aria-label="Texto derecho" value={slide.right_body} onChange={(e) => update(i, { right_body: e.target.value })} />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {slide.kind !== "cover" && slide.kind !== "cta" && (
              <Field label="Fuente">
                <Input value={slide.source} placeholder="BrightEdge, febrero 2026" onChange={(e) => update(i, { source: e.target.value })} />
              </Field>
            )}
            {slide.kind === "cta" && (
              <Field label="Texto del botón">
                <Input value={slide.button} placeholder="Leela en crabsense.com/blog" onChange={(e) => update(i, { button: e.target.value })} />
              </Field>
            )}
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" className="justify-self-start" onClick={add}>
        <PlusIcon /> Agregar slide
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
