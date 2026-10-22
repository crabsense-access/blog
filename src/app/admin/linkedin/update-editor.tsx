"use client";

import { PlusIcon, TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_COLORS, type ServiceSlug, type UpdateTemplate } from "@/lib/linkedin-update";
import { selectClass } from "./slides-editor";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Card({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <span className="w-8 text-sm font-semibold tracking-wider text-muted-foreground">{n}</span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {children}
    </div>
  );
}

function StringList({
  items,
  onChange,
  placeholder,
  max,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  max: number;
}) {
  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input
            aria-label={`Ítem ${i + 1}`}
            value={it}
            placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))}
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Quitar" onClick={() => onChange(items.filter((_, k) => k !== i))}>
            <TrashIcon />
          </Button>
        </div>
      ))}
      {items.length < max && (
        <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onChange([...items, ""])}>
          <PlusIcon /> Ítem
        </Button>
      )}
    </div>
  );
}

export function UpdateEditor({ data, onChange }: { data: UpdateTemplate; onChange: (d: UpdateTemplate) => void }) {
  const set = (patch: Partial<UpdateTemplate>) => onChange({ ...data, ...patch });

  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">
        Plantilla fija de 5 slides. En los títulos, el texto entre <code>**dobles asteriscos**</code> se pinta en violeta.
      </p>

      <Card n="I" title="Portada">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Pill de plataforma">
            <Input value={data.platform} onChange={(e) => set({ platform: e.target.value })} />
          </Field>
          <Field label="Color (servicio)">
            <select className={selectClass} value={data.service} onChange={(e) => set({ service: e.target.value as ServiceSlug })}>
              {Object.entries(SERVICE_COLORS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha">
            <Input value={data.date_label} placeholder="21 SEP 2026" onChange={(e) => set({ date_label: e.target.value })} />
          </Field>
        </div>
        <Field label="Titular (dentro del anillo)" hint="Qué podés hacer ahora. Máx. ~12 palabras.">
          <Input value={data.headline} onChange={(e) => set({ headline: e.target.value })} />
        </Field>
        <Field label="Bajada">
          <Input value={data.lead} onChange={(e) => set({ lead: e.target.value })} />
        </Field>
      </Card>

      <Card n="II" title="Qué cambió">
        <Field label="Título">
          <Input value={data.changed_title} onChange={(e) => set({ changed_title: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Field label="Antes · etiqueta">
              <Input value={data.before_label} onChange={(e) => set({ before_label: e.target.value })} />
            </Field>
            <Field label="Antes · nota">
              <Input value={data.before_note} onChange={(e) => set({ before_note: e.target.value })} />
            </Field>
            <span className="text-xs font-medium text-muted-foreground">Ítems (empezá con “+” para el cierre en itálica)</span>
            <StringList items={data.before_items} onChange={(v) => set({ before_items: v })} placeholder="free-traffic-seo.xyz" max={4} />
          </div>
          <div className="grid gap-2">
            <Field label="Ahora · etiqueta">
              <Input value={data.after_label} onChange={(e) => set({ after_label: e.target.value })} />
            </Field>
            <Field label="Ahora · nota">
              <Input value={data.after_note} onChange={(e) => set({ after_note: e.target.value })} />
            </Field>
            <span className="text-xs font-medium text-muted-foreground">Ítems</span>
            <StringList items={data.after_items} onChange={(v) => set({ after_items: v })} placeholder="tutienda.com.ar" max={4} />
          </div>
        </div>
      </Card>

      <Card n="III" title="La letra chica (3)">
        <Field label="Título">
          <Input value={data.fine_title} onChange={(e) => set({ fine_title: e.target.value })} />
        </Field>
        {data.fine_items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
            <Input
              aria-label="Título del detalle"
              value={it.title}
              onChange={(e) => set({ fine_items: data.fine_items.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })}
            />
            <Input
              aria-label="Descripción del detalle"
              value={it.description}
              onChange={(e) =>
                set({ fine_items: data.fine_items.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)) })
              }
            />
            <Button type="button" variant="ghost" size="icon" aria-label="Quitar" onClick={() => set({ fine_items: data.fine_items.filter((_, k) => k !== i) })}>
              <TrashIcon />
            </Button>
          </div>
        ))}
        {data.fine_items.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-self-start"
            onClick={() => set({ fine_items: [...data.fine_items, { title: "", description: "" }] })}
          >
            <PlusIcon /> Detalle
          </Button>
        )}
      </Card>

      <Card n="IV" title="Qué hacer (3–4 pasos)">
        <Field label="Título">
          <Input value={data.steps_title} onChange={(e) => set({ steps_title: e.target.value })} />
        </Field>
        {data.steps.map((st, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_7rem_auto] gap-2">
            <Input
              aria-label="Paso"
              value={st.title}
              onChange={(e) => set({ steps: data.steps.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)) })}
            />
            <Input
              aria-label="Detalle del paso"
              value={st.description}
              onChange={(e) => set({ steps: data.steps.map((x, k) => (k === i ? { ...x, description: e.target.value } : x)) })}
            />
            <Input
              aria-label="Cuándo"
              value={st.when}
              placeholder="Hoy"
              onChange={(e) => set({ steps: data.steps.map((x, k) => (k === i ? { ...x, when: e.target.value } : x)) })}
            />
            <Button type="button" variant="ghost" size="icon" aria-label="Quitar" onClick={() => set({ steps: data.steps.filter((_, k) => k !== i) })}>
              <TrashIcon />
            </Button>
          </div>
        ))}
        {data.steps.length < 4 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-self-start"
            onClick={() => set({ steps: [...data.steps, { title: "", description: "", when: "" }] })}
          >
            <PlusIcon /> Paso
          </Button>
        )}
      </Card>

      <Card n="V" title="Nuestra lectura">
        <Field label="Opinión">
          <Textarea rows={2} value={data.verdict} onChange={(e) => set({ verdict: e.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Impacto">
            <select className={selectClass} value={data.impact} onChange={(e) => set({ impact: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value={1}>Bajo</option>
              <option value={2}>Medio</option>
              <option value={3}>Alto</option>
            </select>
          </Field>
          <Field label="Urgencia">
            <select className={selectClass} value={data.urgency} onChange={(e) => set({ urgency: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value={1}>Baja</option>
              <option value={2}>Media</option>
              <option value={3}>Alta</option>
            </select>
          </Field>
          <Field label="Botón (va a /#contacto)">
            <Input value={data.cta} onChange={(e) => set({ cta: e.target.value })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}
