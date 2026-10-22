"use client";

import { useState } from "react";
import { ImageDownIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const W = 1080;
const H = 1350;

const nextFrames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)));
    step(n);
  });

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Descarga cada slide de la vista de exportación (.li-export-page) como PNG
 * de 1080×1350. Con una sola slide baja el PNG; con varias, un ZIP con
 * todas numeradas en orden, listas para subir como carrusel de imágenes.
 */
export function PngDownloadButton({ fileBase }: { fileBase: string }) {
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const pages = Array.from(document.querySelectorAll<HTMLElement>(".li-export-page"));
    const root = document.documentElement;
    try {
      const { toBlob } = await import("html-to-image");
      // Las slides usan unidades relativas al ancho (cqw): se agrandan a
      // 1080 px reales para capturarlas en tamaño nativo y el anillo
      // (canvas) se redibuja a esa resolución.
      root.classList.add("li-exporting-png");
      await document.fonts.ready;
      await nextFrames(4);

      const blobs: Blob[] = [];
      for (const page of pages) {
        const blob = await toBlob(page, {
          width: W,
          height: H,
          pixelRatio: 1,
          cacheBust: true,
          style: { boxShadow: "none" },
        });
        if (!blob) throw new Error("No se pudo generar la imagen.");
        blobs.push(blob);
      }

      if (blobs.length === 1) {
        download(blobs[0], `${fileBase}.png`);
      } else {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        blobs.forEach((b, i) => zip.file(`${fileBase}-${String(i + 1).padStart(2, "0")}.png`, b));
        download(await zip.generateAsync({ type: "blob" }), `${fileBase}.zip`);
      }
      toast.success(blobs.length === 1 ? "Imagen descargada." : `${blobs.length} imágenes descargadas (ZIP).`);
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron generar las imágenes. Probá de nuevo.");
    } finally {
      root.classList.remove("li-exporting-png");
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={run} disabled={busy}>
      {busy ? <Loader2Icon className="animate-spin" /> : <ImageDownIcon />}
      {busy ? "Generando imágenes…" : "Descargar imágenes (PNG)"}
    </Button>
  );
}
