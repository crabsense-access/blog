"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Muestra una imagen y, si tiene fondo blanco sólido (no es un PNG
 * transparente), le quita ese fondo en el navegador: pinta de transparente
 * los píxeles casi blancos conectados con el borde de la imagen (flood
 * fill), así lo que está detrás (ej. el anillo animado) queda por detrás de
 * la figura y no se ve a través de sus partes blancas interiores.
 *
 * Mientras procesa (o si falla, por ejemplo por CORS) muestra la imagen
 * original con mix-blend-multiply, que sobre fondo blanco ya disimula el
 * fondo. Si la imagen ya es transparente, se usa tal cual.
 */
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
  const [cutSrc, setCutSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, w, h);
        const d = data.data;

        // si ya tiene transparencia en las esquinas, no hace falta recortar
        const corners = [0, w - 1, (h - 1) * w, h * w - 1];
        if (corners.some((i) => d[i * 4 + 3] < 250)) {
          setCutSrc(src);
          return;
        }

        const isWhite = (i: number) =>
          d[i * 4] >= threshold && d[i * 4 + 1] >= threshold && d[i * 4 + 2] >= threshold;
        const seen = new Uint8Array(w * h);
        const stack: number[] = [];
        const push = (i: number) => {
          if (!seen[i] && isWhite(i)) {
            seen[i] = 1;
            stack.push(i);
          }
        };
        for (let x = 0; x < w; x++) {
          push(x);
          push((h - 1) * w + x);
        }
        for (let y = 0; y < h; y++) {
          push(y * w);
          push(y * w + w - 1);
        }
        while (stack.length) {
          const i = stack.pop()!;
          d[i * 4 + 3] = 0;
          const x = i % w;
          if (x > 0) push(i - 1);
          if (x < w - 1) push(i + 1);
          if (i >= w) push(i - w);
          if (i < w * (h - 1)) push(i + w);
        }
        // borde suave: los píxeles de la figura pegados al fondo quitado
        // quedan semitransparentes según qué tan claros son
        for (let i = 0; i < w * h; i++) {
          if (seen[i]) continue;
          const x = i % w;
          const nearBg =
            (x > 0 && seen[i - 1]) ||
            (x < w - 1 && seen[i + 1]) ||
            (i >= w && seen[i - w]) ||
            (i < w * (h - 1) && seen[i + w]);
          if (nearBg) {
            const light = Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
            if (light > 200) d[i * 4 + 3] = Math.round(255 * (1 - (light - 200) / 55) * 0.8 + 51);
          }
        }
        ctx.putImageData(data, 0, 0);
        canvas.toBlob((blob) => {
          if (!blob || cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          setCutSrc(objectUrl);
        }, "image/png");
      } catch {
        // CORS u otro error: nos quedamos con la original + multiply
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, threshold]);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano
    <img
      src={cutSrc ?? src}
      alt={alt}
      decoding="async"
      className={cn(className, !cutSrc && "mix-blend-multiply")}
    />
  );
}
