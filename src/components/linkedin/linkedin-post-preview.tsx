"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { isCarouselFormat, type LinkedInFormat, type LinkedInSlide, type LinkedInStyle } from "@/lib/linkedin";
import { UPDATE_SLIDE_COUNT, type UpdateTemplate } from "@/lib/linkedin-update";
import { LinkedInSlideView } from "./linkedin-slide";
import { UpdateSlideView } from "./update-slide";

interface LinkedInPostPreviewProps {
  authorName: string;
  authorSubtitle: string;
  authorAvatarUrl?: string | null;
  caption: string;
  hashtags: string[];
  slides: LinkedInSlide[];
  style: LinkedInStyle;
  format: LinkedInFormat;
  docTitle: string;
  /** tipo II: plantilla con diseño propio (reemplaza a `slides`) */
  updateData?: UpdateTemplate | null;
}

/** Simulación de cómo se ve el post en el feed de LinkedIn. */
export function LinkedInPostPreview({
  authorName,
  authorSubtitle,
  authorAvatarUrl,
  caption,
  hashtags,
  slides,
  style,
  format,
  docTitle,
  updateData,
}: LinkedInPostPreviewProps) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const total = updateData ? (format === "image" ? 1 : UPDATE_SLIDE_COUNT) : slides.length;
  const current = Math.min(index, Math.max(0, total - 1));
  const showSlides = format !== "text" && total > 0;
  const visibleSlides = format === "image" ? slides.slice(0, 1) : slides;
  const slideCount = updateData ? (format === "image" ? 1 : UPDATE_SLIDE_COUNT) : visibleSlides.length;

  const fullText =
    caption + (hashtags.length ? `\n\n${hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}` : "");

  return (
    <div className="rounded-xl bg-[#f4f2ee] p-3 dark:bg-zinc-900">
      <article className="overflow-hidden rounded-lg border border-black/10 bg-white text-[14px] leading-[1.43] text-[#191919] dark:border-white/10 dark:bg-[#1b1f23] dark:text-[#e9e9e9]">
        <div className="flex gap-2.5 px-4 pt-3">
          <div className="grid size-12 flex-none place-items-center overflow-hidden rounded-md border border-black/10 bg-white">
            {authorAvatarUrl ? (
              <img src={authorAvatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <img src="/crabsense-logo.svg" alt="" className="w-11" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">{authorName}</div>
            <div className="text-xs text-[#666] dark:text-[#a8a8a8]">{authorSubtitle}</div>
            <div className="text-xs text-[#666] dark:text-[#a8a8a8]">Ahora · 🌐</div>
          </div>
          <div className="ml-auto whitespace-nowrap text-sm font-semibold text-[#0a66c2] dark:text-[#71b7fb]">
            + Seguir
          </div>
        </div>

        <div
          className={cn(
            "whitespace-pre-line break-words px-4 pb-2 pt-2.5",
            !expanded && "max-h-[calc(3*1.43em+10px)] overflow-hidden"
          )}
        >
          {fullText || <span className="text-[#999]">(Sin texto todavía)</span>}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="px-4 pb-2.5 text-sm text-[#666] hover:text-[#0a66c2] hover:underline dark:text-[#a8a8a8]"
        >
          {expanded ? "menos" : "…más"}
        </button>

        {showSlides && (
          <>
            {format === "carousel" && (
              <div className="flex items-center justify-between gap-2 bg-[#1d2226] px-3 py-2 text-[13px] text-white">
                <span className="truncate">{docTitle}</span>
                <span className="flex-none tabular-nums opacity-85">
                  {current + 1} / {total}
                </span>
              </div>
            )}
            <div className="relative overflow-hidden bg-[#e9e9ef]">
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(${-current * 100}%)` }}
              >
                {updateData
                  ? Array.from({ length: slideCount }, (_, i) => (
                      <div key={i} className="w-full flex-none">
                        <UpdateSlideView data={updateData} index={i} style={style} animated={i === current} />
                      </div>
                    ))
                  : visibleSlides.map((slide, i) => (
                      <div key={i} className="w-full flex-none">
                        <LinkedInSlideView slide={slide} index={i} total={visibleSlides.length} style={style} />
                      </div>
                    ))}
              </div>
              {isCarouselFormat(format) && current > 0 && (
                <button
                  type="button"
                  aria-label="Slide anterior"
                  onClick={() => setIndex(current - 1)}
                  className="absolute left-2.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
              )}
              {isCarouselFormat(format) && current < total - 1 && (
                <button
                  type="button"
                  aria-label="Slide siguiente"
                  onClick={() => setIndex(current + 1)}
                  className="absolute right-2.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"
                >
                  <ChevronRightIcon className="size-5" />
                </button>
              )}
            </div>
            {/* carrusel de imágenes: LinkedIn muestra puntitos debajo, no barra */}
            {format === "image_carousel" && total > 1 && (
              <div className="flex justify-center gap-1.5 py-2">
                {Array.from({ length: total }, (_, i) => (
                  <span
                    key={i}
                    className={cn("size-1.5 rounded-full", i === current ? "bg-[#0a66c2]" : "bg-black/20")}
                  />
                ))}
              </div>
            )}
            {format === "carousel" && (
              <div className="h-[3px] bg-black/10">
                <i
                  className="block h-full bg-[#0a66c2] transition-[width]"
                  style={{ width: `${((current + 1) / total) * 100}%` }}
                />
              </div>
            )}
          </>
        )}

        <div className="flex justify-between border-b border-black/10 px-4 py-2 text-xs text-[#666] dark:border-white/10 dark:text-[#a8a8a8]">
          <span>👍💡 Simulación</span>
          <span>Comentarios · Compartidos</span>
        </div>
        <div className="flex justify-around px-2 py-1 text-[13px] font-semibold text-[#666] dark:text-[#a8a8a8]">
          <span className="p-2.5">Recomendar</span>
          <span className="p-2.5">Comentar</span>
          <span className="p-2.5">Compartir</span>
          <span className="p-2.5">Enviar</span>
        </div>
      </article>
    </div>
  );
}
