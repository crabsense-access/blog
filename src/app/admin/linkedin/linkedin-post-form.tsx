"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import Link from "next/link";
import { CopyIcon, FileDownIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LinkedInPostPreview } from "@/components/linkedin/linkedin-post-preview";
import { useSuccessToast } from "@/lib/use-success-toast";
import {
  FORMAT_LABELS,
  LINKEDIN_TYPES,
  LINKEDIN_TYPE_ORDER,
  PLATFORMS,
  STATUS_LABELS,
  normalizeSlide,
  type LinkedInFormat,
  type LinkedInPost,
  type LinkedInPostType,
  type LinkedInSlide,
  type LinkedInStatus,
  type LinkedInStyle,
} from "@/lib/linkedin";
import type { Profile } from "@/lib/types";
import type { SuccessCase } from "@/lib/success-cases";
import {
  generateLinkedInPost,
  type GenerateLinkedInState,
  type LinkedInFormState,
} from "./actions";
import { SlidesEditor, selectClass } from "./slides-editor";
import { UpdateEditor } from "./update-editor";
import { normalizeUpdateTemplate, serviceForPlatform, type UpdateTemplate } from "@/lib/linkedin-update";

const initialGenState: GenerateLinkedInState = {};
const initialFormState: LinkedInFormState = {};

interface LinkedInPostFormProps {
  post?: LinkedInPost;
  initialType?: LinkedInPostType;
  postOptions: { id: string; title: string; status: string }[];
  cases: SuccessCase[];
  profiles: Profile[];
  action: (state: LinkedInFormState, formData: FormData) => Promise<LinkedInFormState>;
  /** genera con IA apenas se abre (viene del Radar con ?generate=1) */
  autoGenerate?: boolean;
  /** fecha inicial (viene del Calendario con ?date=) */
  initialDate?: string;
}

export function LinkedInPostForm({
  post,
  initialType,
  postOptions,
  cases,
  profiles,
  action,
  autoGenerate,
  initialDate,
}: LinkedInPostFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, initialFormState);
  useSuccessToast(state, initialFormState);
  const [genState, genAction, genPending] = useActionState(generateLinkedInPost, initialGenState);

  const [type, setType] = useState<LinkedInPostType>(post?.type ?? initialType ?? "article");
  const config = LINKEDIN_TYPES[type];

  const [format, setFormat] = useState<LinkedInFormat>(post?.format ?? config.defaultFormat);
  const [sourcePostId, setSourcePostId] = useState(post?.source_post_id ?? "");
  const [sourceCaseId, setSourceCaseId] = useState(post?.source_case_id ?? "");
  const [sourceUrl, setSourceUrl] = useState(post?.source_url ?? "");
  const [platform, setPlatform] = useState(post?.platform ?? "");
  const [sourceNotes, setSourceNotes] = useState(post?.source_notes ?? "");
  const [profileId, setProfileId] = useState(post?.publish_as_profile_id ?? "");

  const [title, setTitle] = useState(post?.title ?? "");
  const [caption, setCaption] = useState(post?.caption ?? "");
  const [firstComment, setFirstComment] = useState(post?.first_comment ?? "");
  const [hashtagsText, setHashtagsText] = useState((post?.hashtags ?? []).join(", "));
  const [slides, setSlides] = useState<LinkedInSlide[]>(post?.slides ?? []);
  const [style, setStyle] = useState<LinkedInStyle>(post?.style ?? "light");
  const [status, setStatus] = useState<LinkedInStatus>(post?.status ?? "draft");
  const [scheduledFor, setScheduledFor] = useState(post?.scheduled_for ?? initialDate ?? "");
  const [scheduledTime, setScheduledTime] = useState(post?.scheduled_time?.slice(0, 5) ?? "");
  const isUpdate = type === "product_update";
  const [updateData, setUpdateData] = useState<UpdateTemplate>(() =>
    normalizeUpdateTemplate(post?.template_data, post?.platform || "GA4")
  );
  const [linkedinUrl, setLinkedinUrl] = useState(post?.linkedin_url ?? "");
  const [previewKey, setPreviewKey] = useState(0);

  // Al cambiar de tipo, ajusta el formato por defecto (patrón "derivar
  // estado durante el render", igual que el form del glosario).
  const [prevType, setPrevType] = useState(type);
  if (type !== prevType) {
    setPrevType(type);
    setFormat(LINKEDIN_TYPES[type].defaultFormat);
  }

  // Cuando la IA responde, precarga todo para revisar (no se guarda solo).
  const [appliedGen, setAppliedGen] = useState(genState.data);
  if (genState.data && genState.data !== appliedGen) {
    const d = genState.data;
    setAppliedGen(d);
    if (!title) setTitle(d.title);
    setCaption(d.caption);
    setFirstComment(d.first_comment);
    setHashtagsText(d.hashtags.map((h) => h.replace(/^#/, "")).join(", "));
    setSlides(d.slides.map((s) => normalizeSlide(s)));
    if (d.update) setUpdateData(d.update);
    setPreviewKey((k) => k + 1);
  }

  const hashtags = hashtagsText
    .split(/[,\s]+/)
    .map((h) => h.replace(/^#/, "").trim())
    .filter(Boolean);

  const profile = profiles.find((p) => p.id === profileId);
  const authorName = profile?.full_name ?? "Crabsense";
  const authorSubtitle = profile
    ? (profile.public_title ?? "Crabsense")
    : "SEO, GEO y Analytics para marcas que quieren crecer";

  const hook = caption.split("\n")[0] ?? "";
  const coverTitle = (slides[0]?.title ?? title).replace(/\*\*/g, "");

  async function copyCaption() {
    const text = caption + (hashtags.length ? `\n\n${hashtags.map((h) => `#${h}`).join(" ")}` : "");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado");
    } catch {
      toast.error("No se pudo copiar; seleccioná el texto a mano.");
    }
  }

  // Se dispara la acción a mano (en vez de <form action>) porque React 19
  // resetea el form después de cada acción y los <select> controlados
  // quedaban mostrando la opción por defecto aunque el estado estaba bien.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }
  // Desde el Radar: generar apenas abre el editor (una sola vez).
  const autoRan = useRef(false);
  useEffect(() => {
    if (!autoGenerate || autoRan.current || !formRef.current) return;
    autoRan.current = true;
    const fd = new FormData(formRef.current);
    startTransition(() => genAction(fd));
  }, [autoGenerate, genAction]);

  function handleGenerate(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const form = e.currentTarget.form;
    if (!form) return;
    const fd = new FormData(form);
    startTransition(() => genAction(fd));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_480px]">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="source_post_id" value={config.sources.includes("post") ? sourcePostId : ""} />
      <input type="hidden" name="source_case_id" value={config.sources.includes("case") ? sourceCaseId : ""} />
      <input type="hidden" name="platform" value={config.sources.includes("platform") ? platform : ""} />
      <input type="hidden" name="publish_as_profile_id" value={profileId} />
      <input type="hidden" name="hashtags" value={JSON.stringify(hashtags)} />
      <input type="hidden" name="slides" value={JSON.stringify(slides)} />
      <input type="hidden" name="template_data" value={isUpdate ? JSON.stringify(updateData) : "null"} />
      <input type="hidden" name="news_item_id" value={post?.news_item_id ?? ""} />
      <input type="hidden" name="scheduled_time" value={scheduledTime} />
      <input type="hidden" name="style" value={style} />
      <input type="hidden" name="status" value={status} />

      <div className="grid min-w-0 gap-8">
        {/* 1. Tipo */}
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">1 · Tipo de post</h2>
          <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
            {LINKEDIN_TYPE_ORDER.map((t) => {
              const c = LINKEDIN_TYPES[t];
              const active = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={active}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    active ? "border-[#53539b] bg-[#53539b]/5 ring-1 ring-[#53539b]" : "hover:border-foreground/30"
                  }`}
                >
                  <span className="text-xs font-semibold tracking-widest text-[#3e787e]">{c.numeral}</span>
                  <span className="mt-0.5 block font-semibold">{c.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </section>

        {/* 2. Fuente */}
        <section className="grid gap-4 rounded-lg border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">2 · Fuente y configuración</h2>

          {config.sources.includes("post") && (
            <div className="grid gap-1.5">
              <Label htmlFor="li-post">Nota del blog{config.required.includes("post") ? " *" : " (opcional)"}</Label>
              <select id="li-post" className={selectClass} value={sourcePostId} onChange={(e) => setSourcePostId(e.target.value)}>
                <option value="">Elegí una nota…</option>
                {postOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.status !== "published" ? " (borrador)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {config.sources.includes("case") && (
            <div className="grid gap-1.5">
              <Label htmlFor="li-case">Caso de éxito (opcional)</Label>
              <select id="li-case" className={selectClass} value={sourceCaseId} onChange={(e) => setSourceCaseId(e.target.value)}>
                <option value="">Cargarlo a mano en las notas…</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.client_name} — {c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {config.sources.includes("platform") && (
            <div className="grid gap-1.5">
              <Label htmlFor="li-platform">Plataforma *</Label>
              <select
                id="li-platform"
                className={selectClass}
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setUpdateData((d) => ({ ...d, platform: e.target.value, service: serviceForPlatform(e.target.value) }));
                }}
              >
                <option value="">Elegí la plataforma…</option>
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          {config.sources.includes("url") && (
            <div className="grid gap-1.5">
              <Label htmlFor="li-url">URL de referencia (opcional)</Label>
              <Input
                id="li-url"
                name="source_url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://support.google.com/analytics/…"
              />
            </div>
          )}
          {!config.sources.includes("url") && <input type="hidden" name="source_url" value="" />}

          <div className="grid gap-1.5">
            <Label htmlFor="li-notes">
              {config.notesLabel}
              {config.required.includes("notes") ? " *" : ""}
            </Label>
            <Textarea
              id="li-notes"
              name="source_notes"
              rows={4}
              value={sourceNotes}
              onChange={(e) => setSourceNotes(e.target.value)}
              placeholder={config.notesPlaceholder}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="li-format">Formato</Label>
              <select id="li-format" className={selectClass} value={format} onChange={(e) => setFormat(e.target.value as LinkedInFormat)}>
                {Object.entries(FORMAT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="li-profile">Publica</Label>
              <select id="li-profile" className={selectClass} value={profileId} onChange={(e) => setProfileId(e.target.value)}>
                <option value="">Página de Crabsense</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name ?? p.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="li-style">Estilo de slides</Label>
              <select id="li-style" className={selectClass} value={style} onChange={(e) => setStyle(e.target.value as LinkedInStyle)}>
                <option value="light">Mármol (claro)</option>
                <option value="dark">Noche (oscuro)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleGenerate} disabled={genPending} variant="secondary">
              <SparklesIcon />
              {genPending ? "Generando… (puede tardar un minuto)" : slides.length || caption ? "Regenerar con IA" : "Generar con IA"}
            </Button>
            {genState.error && <p className="text-sm text-destructive">{genState.error}</p>}
            {genState.usage && !genPending && (
              <p className="text-xs text-muted-foreground">
                {genState.usage.inputTokens.toLocaleString("es-AR")} tokens de entrada ·{" "}
                {genState.usage.outputTokens.toLocaleString("es-AR")} de salida
              </p>
            )}
          </div>
          {(slides.length > 0 || caption) && (
            <p className="text-xs text-muted-foreground">
              Regenerar reemplaza el texto y las slides actuales (el título interno se mantiene).
            </p>
          )}
        </section>

        {/* 3. Texto */}
        <section className="grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">3 · Texto del post</h2>
          <div className="grid gap-1.5">
            <Label htmlFor="li-title">Título interno *</Label>
            <Input id="li-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Para identificarlo en el listado" />
            {state.fieldErrors?.title && <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>}
          </div>
          <div className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="li-caption">Caption</Label>
              <span className={`text-xs tabular-nums ${caption.length > 3000 ? "text-destructive" : "text-muted-foreground"}`}>
                {caption.length.toLocaleString("es-AR")} / 3.000
              </span>
            </div>
            <Textarea id="li-caption" name="caption" rows={10} value={caption} onChange={(e) => setCaption(e.target.value)} />
            {hook && (
              <p className="text-xs text-muted-foreground">
                Gancho (lo que se ve antes del “…más”): <span className="text-foreground">{hook.slice(0, 140)}</span>
                {hook.length > 140 && " … (muy largo, se corta)"}
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="li-comment">Primer comentario (acá va el link)</Label>
            <Textarea id="li-comment" name="first_comment" rows={2} value={firstComment} onChange={(e) => setFirstComment(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="li-tags">Hashtags (separados por coma)</Label>
            <Input id="li-tags" value={hashtagsText} onChange={(e) => setHashtagsText(e.target.value)} placeholder="GEO, SEO, GA4" />
          </div>
        </section>

        {/* 4. Slides */}
        {isUpdate ? (
          <section className="grid gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">4 · Slides (plantilla Novedades)</h2>
            <UpdateEditor data={updateData} onChange={setUpdateData} />
          </section>
        ) : format !== "text" || slides.length > 0 ? (
          <section className="grid gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              4 · Slides {format === "image" && "(se usa solo la primera)"}
              {format === "image_carousel" && "(cada slide se publica como una imagen)"}
              {format === "text" && "(el post es de solo texto: estas slides no se publican)"}
            </h2>
            <SlidesEditor slides={slides} onChange={setSlides} />
          </section>
        ) : null}

        {/* 5. Publicación */}
        <section className="grid gap-4 rounded-lg border p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">5 · Publicación</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="li-status">Estado</Label>
              <select id="li-status" className={selectClass} value={status} onChange={(e) => setStatus(e.target.value as LinkedInStatus)}>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="li-date">Fecha y hora de publicación</Label>
              <div className="flex gap-2">
                <Input id="li-date" name="scheduled_for" type="date" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} />
                <Input
                  aria-label="Hora de publicación"
                  type="time"
                  className="w-28"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="li-link">Link al post publicado</Label>
              <Input id="li-link" name="linkedin_url" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/posts/…" />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : post ? "Guardar cambios" : "Guardar borrador"}
          </Button>
          {post && format !== "text" && (
            <Button asChild variant="outline">
              <Link href={`/admin/linkedin/${post.id}/export`} target="_blank">
                <FileDownIcon />
                {format === "carousel" ? "Exportar PDF" : "Exportar imágenes"}
              </Link>
            </Button>
          )}
          <Button type="button" variant="outline" onClick={copyCaption} disabled={!caption}>
            <CopyIcon />
            Copiar texto
          </Button>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.fieldErrors && !state.fieldErrors.title && (
            <p className="text-sm text-destructive">Revisá los campos: hay datos inválidos.</p>
          )}
        </div>
        {post && format !== "text" && (
          <p className="-mt-5 text-xs text-muted-foreground">
            Exportar abre las slides en una pestaña nueva: guardá los cambios antes.{" "}
            {format === "carousel"
              ? "Usá Imprimir → Guardar como PDF."
              : "Tocá “Descargar imágenes (PNG)” para bajarlas."}
          </p>
        )}
      </div>

      {/* Preview */}
      <aside className="min-w-0">
        <div className="grid gap-3 xl:sticky xl:top-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preview en LinkedIn</h2>
          <LinkedInPostPreview
            key={previewKey}
            authorName={authorName}
            authorSubtitle={authorSubtitle}
            authorAvatarUrl={profile?.avatar_url}
            caption={caption}
            hashtags={hashtags}
            slides={slides}
            style={style}
            format={format}
            docTitle={(isUpdate ? updateData.headline.replace(/\*\*/g, "") : coverTitle) || "Documento"}
            updateData={isUpdate ? updateData : null}
          />
        </div>
      </aside>
    </form>
  );
}
