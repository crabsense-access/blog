"use client";

import { useId, useState, useTransition } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";

import { submitContactForm } from "@/app/(site)/lead-actions";
import { cn } from "@/lib/utils";
import type { ContactFormField } from "@/lib/validations/lead";

function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

const FIELDS: {
  name: ContactFormField;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
}[] = [
  { name: "name", label: "Nombre", placeholder: "Tu nombre", autoComplete: "name", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "tu@email.com", autoComplete: "email", required: true },
  { name: "phone", label: "Teléfono", type: "tel", placeholder: "+54 9 11 …", autoComplete: "tel", inputMode: "tel" },
  { name: "website_url", label: "Sitio web", placeholder: "tuempresa.com", autoComplete: "url", inputMode: "url" },
];

const inputClass =
  "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-950 placeholder:text-neutral-400 transition-colors focus:border-neutral-400 focus:outline-none aria-[invalid=true]:border-red-400";

/**
 * Formulario de contacto del bloque "¿Listo para transformar tu negocio?" de
 * la home. Guarda en Supabase (tabla leads, source = 'form'), avisa al equipo
 * y muestra un mensaje de confirmación.
 */
export function ContactForm({ className }: { className?: string }) {
  const uid = useId();
  const [values, setValues] = useState<Record<ContactFormField, string>>({
    name: "",
    email: "",
    phone: "",
    website_url: "",
    message: "",
    page_path: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ContactFormField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (field: ContactFormField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const res = await submitContactForm({
        ...values,
        page_path: window.location.pathname,
        company: honeypot,
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error ?? "No pudimos enviar tu consulta.");
        return;
      }
      track("generate_lead", { lead_source: "contact_form" });
      setDone(true);
    });
  }

  return (
    <div
      className={cn(
        "rounded-[28px] border border-neutral-200 bg-white/90 p-6 shadow-[0_10px_40px_-12px_rgba(61,60,137,0.25)] backdrop-blur md:p-10",
        className
      )}
    >
      {done ? (
        <div role="status" className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="mb-4 size-12 text-[#53539b]" strokeWidth={1.5} />
          <p className="font-heading text-2xl tracking-tight text-neutral-950 md:text-3xl">
            ¡Gracias, {values.name.trim().split(/\s+/)[0]}!
          </p>
          <p className="mt-3 max-w-md text-base leading-relaxed text-neutral-600">
            Recibimos tu mensaje. En breve nos vamos a estar comunicando con vos.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((f) => {
            const id = `${uid}-${f.name}`;
            const err = errors[f.name];
            return (
              <div key={f.name} className="grid gap-1.5">
                <label htmlFor={id} className="text-sm font-medium text-neutral-700">
                  {f.label}
                  {f.required ? <span className="text-[#53539b]"> *</span> : null}
                </label>
                <input
                  id={id}
                  name={f.name}
                  type={f.type ?? "text"}
                  value={values[f.name]}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  autoComplete={f.autoComplete}
                  inputMode={f.inputMode}
                  required={f.required}
                  aria-invalid={!!err}
                  aria-describedby={err ? `${id}-error` : undefined}
                  className={inputClass}
                />
                {err && (
                  <p id={`${id}-error`} className="text-xs text-red-600">
                    {err}
                  </p>
                )}
              </div>
            );
          })}

          <div className="grid gap-1.5 md:col-span-2">
            <label htmlFor={`${uid}-message`} className="text-sm font-medium text-neutral-700">
              Comentario
            </label>
            <textarea
              id={`${uid}-message`}
              name="message"
              rows={5}
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Contanos sobre tu proyecto…"
              aria-invalid={!!errors.message}
              className={cn(inputClass, "resize-y")}
            />
            {errors.message && <p className="text-xs text-red-600">{errors.message}</p>}
          </div>

          {/* honeypot anti-spam (oculto para personas) */}
          <input
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            name="company"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
          />

          <div className="flex flex-col-reverse items-center gap-4 md:col-span-2 md:flex-row md:justify-between">
            <p className="min-h-5 text-sm text-red-600" role="alert">
              {formError}
            </p>
            <button
              type="submit"
              disabled={pending}
              className="group inline-flex items-center gap-2 rounded-full bg-[#53539b] py-3.5 pl-9 pr-8 text-[0.8rem] font-medium uppercase tracking-wide text-white transition-colors hover:bg-[#3d3c89] disabled:opacity-60 max-md:w-full max-md:justify-center"
            >
              {pending ? "Enviando…" : "Enviar"}
              {pending ? (
                <Loader2 className="size-4.5 animate-spin" />
              ) : (
                <ArrowUpRight className="size-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
