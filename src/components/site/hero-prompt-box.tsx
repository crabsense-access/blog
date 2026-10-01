"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ArrowUp, Check, Loader2, Plus, X } from "lucide-react";

import { submitLead } from "@/app/(site)/lead-actions";
import { cn } from "@/lib/utils";
import {
  LEAD_SERVICE_OPTIONS,
  detectContactType,
  normalizeWebsite,
  type LeadService,
} from "@/lib/validations/lead";

type Step = "prompt" | "contact" | "done";

function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

const labelOf = (s: LeadService) => LEAD_SERVICE_OPTIONS.find((o) => o.value === s)?.label ?? s;
const colorOf = (s: LeadService) =>
  LEAD_SERVICE_OPTIONS.find((o) => o.value === s)?.color ?? "#4a4a4a";

/**
 * Bloque tipo "prompt de ChatGPT" para captar leads:
 * 1) la persona escribe su proyecto y elige servicios con el "+"
 * 2) al enviar, le pedimos email o celular
 * 3) se guarda en Supabase (tabla leads) y confirmamos contacto en < 10 min
 */
export function HeroPromptBox({
  className,
  headingAs: Heading = "h1",
  question = "¿Qué proyecto tenés en mente hoy?",
  placeholder = "Contanos qué necesitás…",
  defaultServices = [],
  transparent = false,
  fitReference,
  questionClassName,
  showQuestion = true,
  minInputHeight = 48,
}: {
  className?: string;
  // Si la home ya tiene un titular (h1) configurado desde el admin, esta
  // pregunta pasa a ser h2 para no duplicar el h1. En los bloques de
  // servicios va como h4.
  headingAs?: "h1" | "h2" | "h3" | "h4";
  /** pregunta de arriba del recuadro */
  question?: string;
  /** texto de ayuda dentro del recuadro */
  placeholder?: string;
  /** servicios ya elegidos al arrancar (ej. ["analytics"] en su bloque) */
  defaultServices?: LeadService[];
  /** true = recuadro translúcido (deja ver lo que tiene detrás) */
  transparent?: boolean;
  /** texto de referencia para calcular el tamaño de la pregunta: con el
   *  mismo valor, varios prompts quedan con la misma letra aunque sus
   *  preguntas tengan distinto largo. Por defecto, la propia pregunta. */
  fitReference?: string;
  /** clases extra para la pregunta (ej. "font-bold") */
  questionClassName?: string;
  /** false = sin la pregunta de arriba (ej. cuando la sección ya tiene título) */
  showQuestion?: boolean;
  /** alto mínimo (px) del área donde se escribe el prompt */
  minInputHeight?: number;
}) {
  const [step, setStep] = useState<Step>("prompt");
  const [message, setMessage] = useState("");
  const [services, setServices] = useState<LeadService[]>(defaultServices);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [contact, setContact] = useState("");
  const [site, setSite] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const siteRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  // ids únicos: puede haber más de un bloque de prompt en la misma página
  const uid = useId();
  const promptId = `${uid}-prompt`;
  const contactId = `${uid}-contact`;
  const siteId = `${uid}-site`;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const refTextRef = useRef<HTMLSpanElement>(null);

  // el título ocupa el 64% del ancho del recuadro del prompt
  useEffect(() => {
    const h1 = titleRef.current;
    // se mide el texto de referencia (si hay) en vez de la pregunta
    const text = refTextRef.current ?? titleTextRef.current;
    if (!h1 || !text) return;
    const fit = () => {
      const target = h1.clientWidth * 0.64; // 64% del ancho del recuadro
      if (!target) return;
      const base = 100;
      h1.style.fontSize = `${base}px`;
      const w = text.getBoundingClientRect().width;
      if (w) h1.style.fontSize = `${(base * target) / w}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(h1);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  const canSend = message.trim().length > 0 || services.length > 0;

  // textarea que crece con el contenido (hasta ~6 líneas)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, Math.max(168, minInputHeight))}px`;
  }, [message, minInputHeight]);

  // cerrar el menú al hacer click afuera o con Esc
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !plusRef.current?.contains(t)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        plusRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const toggleService = (s: LeadService) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const sendPrompt = () => {
    if (!canSend) return;
    setMenuOpen(false);
    setStep("contact");
    setTyping(true);
    track("prompt_submit", { lead_services: services.join(",") });
    window.setTimeout(() => {
      setTyping(false);
      contactRef.current?.focus();
    }, 900);
  };

  const sendContact = () => {
    setError(null);
    if (!detectContactType(contact)) {
      setError("Ingresá un email o un celular válido.");
      contactRef.current?.focus();
      return;
    }
    if (!normalizeWebsite(site)) {
      setError("Ingresá un sitio web válido (ej. tuempresa.com).");
      siteRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const res = await submitLead({
        services,
        message: message.trim(),
        contact: contact.trim(),
        website_url: site.trim(),
        page_path: window.location.pathname,
        website: honeypot,
      });
      if (!res.ok) {
        setError(res.error ?? "No pudimos enviar tu consulta.");
        return;
      }
      track("generate_lead", {
        lead_services: services.join(","),
        contact_type: detectContactType(contact),
      });
      setStep("done");
    });
  };

  const reset = () => {
    setStep("prompt");
    setMessage("");
    setServices(defaultServices);
    setContact("");
    setSite("");
    setError(null);
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const chips = (removable: boolean) =>
    services.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {services.map((s) => (
          <span
            key={s}
            // color del servicio: texto en el color y fondo del mismo color
            // muy clarito (hex + "1f" = ~12% de opacidad)
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide"
            style={{ color: colorOf(s), backgroundColor: `${colorOf(s)}1f` }}
          >
            {labelOf(s)}
            {removable && (
              <button
                type="button"
                onClick={() => toggleService(s)}
                className="-mr-1 rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Quitar ${labelOf(s)}`}
              >
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
      </div>
    );

  return (
    <div className={cn("@container w-full", className)}>
      {showQuestion && (
        <Heading
          ref={titleRef}
          className={cn(
            "relative mb-3 whitespace-nowrap pl-[2%] text-[3.9cqi] font-light leading-tight tracking-tight text-[#4a4a4a]",
            questionClassName
          )}
        >
          <span ref={titleTextRef} className="inline-block">
            {question}
          </span>
          {fitReference && (
            <span
              ref={refTextRef}
              aria-hidden
              className="pointer-events-none invisible absolute left-0 top-0 inline-block"
            >
              {fitReference}
            </span>
          )}
        </Heading>
      )}

      <div
        className={cn(
          "relative rounded-[28px] border p-3",
          transparent
            ? "border-neutral-200/70 bg-white/30 backdrop-blur-sm"
            : "border-neutral-200 bg-white/90 shadow-[0_10px_40px_-12px_rgba(61,60,137,0.25)] backdrop-blur"
        )}
      >
        {step === "prompt" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendPrompt();
            }}
          >
            {services.length > 0 && <div className="px-2 pb-2 pt-1">{chips(true)}</div>}
            <label htmlFor={promptId} className="sr-only">
              Contanos sobre tu proyecto
            </label>
            <textarea
              id={promptId}
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendPrompt();
                }
              }}
              placeholder={placeholder}
              style={{ minHeight: minInputHeight }}
              className="block min-h-[48px] w-full resize-none bg-transparent px-2 py-2 text-base text-neutral-950 placeholder:text-neutral-400 focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between">
              <div className="relative">
                <button
                  ref={plusRef}
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-controls={menuId}
                  aria-label="Elegir tipo de proyecto"
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100",
                    menuOpen && "bg-neutral-100"
                  )}
                >
                  <Plus className={cn("size-5 transition-transform", menuOpen && "rotate-45")} />
                </button>
                {menuOpen && (
                  <div
                    ref={menuRef}
                    id={menuId}
                    role="menu"
                    className="absolute bottom-11 left-0 z-20 w-72 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl"
                  >
                    <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Tipo de proyecto
                    </p>
                    {LEAD_SERVICE_OPTIONS.map((o) => {
                      const on = services.includes(o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          role="menuitemcheckbox"
                          aria-checked={on}
                          onClick={() => toggleService(o.value)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-neutral-50"
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-md border",
                              on ? "text-white" : "border-neutral-300"
                            )}
                            style={on ? { backgroundColor: o.color, borderColor: o.color } : undefined}
                          >
                            {on && <Check className="size-3.5" />}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-neutral-900">{o.label}</span>
                            <span className="block text-xs text-neutral-500">{o.description}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Enviar"
                className="flex size-9 items-center justify-center rounded-full bg-neutral-950 text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                <ArrowUp className="size-5" />
              </button>
            </div>
          </form>
        )}

        {step !== "prompt" && (
          <div className="space-y-4 px-2 py-2">
            {/* mensaje de la persona */}
            <div className="w-full space-y-2 rounded-3xl bg-neutral-100 px-4 py-3 text-sm text-neutral-900">
              {chips(false)}
              {message.trim() && <p className="whitespace-pre-wrap">{message.trim()}</p>}
            </div>

            {/* respuesta */}
            {typing ? (
              <div className="flex items-center gap-1 px-1 py-2" aria-label="Escribiendo">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="size-2 animate-bounce rounded-full bg-neutral-400"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            ) : step === "contact" ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-neutral-800">
                  ¡Genial! Dejanos tu <strong>email o celular</strong> y tu{" "}
                  <strong>sitio web</strong>, y en <strong>menos de 10 minutos</strong> nos vamos a
                  estar contactando con vos.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendContact();
                  }}
                  className="space-y-2"
                >
                  <div className="flex items-center rounded-full border border-neutral-200 bg-white px-4 py-2 focus-within:border-neutral-400">
                    <label htmlFor={contactId} className="sr-only">
                      Email o celular
                    </label>
                    <input
                      id={contactId}
                      ref={contactRef}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="tu@email.com o +54 9 11 …"
                      autoComplete="email"
                      className="min-w-0 flex-1 bg-transparent text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-4 pr-1 focus-within:border-neutral-400">
                    <label htmlFor={siteId} className="sr-only">
                      Sitio web
                    </label>
                    <input
                      id={siteId}
                      ref={siteRef}
                      value={site}
                      onChange={(e) => setSite(e.target.value)}
                      placeholder="tuempresa.com"
                      autoComplete="url"
                      inputMode="url"
                      className="min-w-0 flex-1 bg-transparent text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none"
                    />
                    {/* honeypot anti-spam (oculto para personas) */}
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      name="website"
                      className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    />
                    <button
                      type="submit"
                      disabled={pending || contact.trim().length < 5 || site.trim().length < 4}
                      aria-label="Enviar datos de contacto"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white transition-colors hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400"
                    >
                      {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
                    </button>
                  </div>
                </form>
                {error && <p className="px-1 text-xs text-red-600">{error}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-neutral-800">
                  ¡Listo! Recibimos tu consulta. Te vamos a contactar a{" "}
                  <strong className="break-all">{contact.trim()}</strong> en menos de 10 minutos.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-medium text-[#3d3c89] hover:underline"
                >
                  Enviar otra consulta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
