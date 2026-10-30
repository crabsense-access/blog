"use client";

import { useEffect, useRef, useState } from "react";

import { optimizedStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";

/**
 * Muestra una imagen y, si tiene fondo blanco sólido (no es un PNG
 * transparente), le quita ese fondo: pinta de transparente los píxeles casi
 * blancos conectados con el borde de la imagen (flood fill), así lo que está
 * detrás (ej. el anillo animado) queda por detrás de la figura y no se ve a
 * través de sus partes blancas interiores.
 *
 * Mientras procesa (o si falla, o el navegador no soporta workers con
 * OffscreenCanvas) muestra la imagen original con mix-blend-multiply, que
 * sobre fondo blanco ya disimula el fondo. Si ya es transparente, se usa tal
 * cual.
 *
 * Rendimiento: no baja ni procesa nada hasta que el elemento está cerca de
 * la vista (las variantes ocultas con display:none nunca cargan), pide la
 * imagen redimensionada al tamaño en que se muestra vía /_next/image, y el
 * recorte corre en un Web Worker (cutout.worker.ts), fuera del hilo
 * principal.
 */

type WorkerRes =
  | { id: number; status: "cut"; blob: Blob }
  | { id: number; status: "transparent" }
  | { id: number; status: "error" };

let worker: Worker | null | undefined;
let nextId = 0;
const pending = new Map<number, (r: WorkerRes) => void>();

function getWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
      worker = null;
    } else {
      worker = new Worker(new URL("./cutout.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<WorkerRes>) => {
        pending.get(e.data.id)?.(e.data);
        pending.delete(e.data.id);
      };
    }
  } catch {
    worker = null;
  }
  return worker;
}

function cutout(url: string, threshold: number): Promise<WorkerRes> | null {
  const w = getWorker();
  if (!w) return null;
  const id = ++nextId;
  // el worker resuelve URLs relativas contra su propio script: pasar absoluta
  const absolute = new URL(url, window.location.href).toString();
  return new Promise((resolve) => {
    pending.set(id, resolve);
    w.postMessage({ id, url: absolute, threshold });
  });
}

export function CutoutImage({
  src,
  alt,
  className,
  threshold = 236,
}: {
  src: string;
  alt: string;
  className?: string;
  /** 0-255: a partir de qué valor (en R, G y B) un píxel cuenta como blanco */
  threshold?: number;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [fetchSrc, setFetchSrc] = useState<string | null>(null);
  const [cutSrc, setCutSrc] = useState<string | null>(null);

  // Elegir el ancho recién cuando el elemento se acerca a la vista
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // el rect que trae el observer (sin forzar un reflow)
        const rect = e.boundingClientRect;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        // object-contain con figuras casi cuadradas: se ven del tamaño del
        // lado corto de la caja
        const shown = Math.min(rect.width, rect.height) > 0 ? Math.min(rect.width, rect.height) : 600;
        setFetchSrc(optimizedStorageImage(src, Math.ceil(shown * dpr)));
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  useEffect(() => {
    if (!fetchSrc) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    cutout(fetchSrc, threshold)?.then((r) => {
      if (cancelled) return;
      if (r.status === "transparent") setCutSrc(fetchSrc);
      else if (r.status === "cut") {
        objectUrl = URL.createObjectURL(r.blob);
        setCutSrc(objectUrl);
      }
      // "error": nos quedamos con la original + multiply
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fetchSrc, threshold]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano
    <img
      ref={imgRef}
      src={cutSrc ?? fetchSrc ?? undefined}
      alt={alt}
      decoding="async"
      className={cn(className, !cutSrc && "mix-blend-multiply")}
    />
  );
}
