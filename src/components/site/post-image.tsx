"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { optimizedStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/utils";

interface PostImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** "lazy" para imágenes fuera de la primera pantalla (cards de carruseles) */
  loading?: "lazy" | "eager";
  /**
   * Si se pasa, las portadas de Supabase Storage se sirven redimensionadas
   * por /_next/image con un srcset (el navegador elige el ancho).
   */
  sizes?: string;
}

const SRCSET_WIDTHS = [384, 640, 828, 1080, 1200];

export function PostImage({ src, alt, className, loading, sizes }: PostImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden bg-muted", className)}>
        <ImageOff className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sizes ? optimizedStorageImage(src, 1080) : src}
        srcSet={
          sizes && optimizedStorageImage(src, 1080) !== src
            ? SRCSET_WIDTHS.map((w) => `${optimizedStorageImage(src, w)} ${w}w`).join(", ")
            : undefined
        }
        sizes={sizes && optimizedStorageImage(src, 1080) !== src ? sizes : undefined}
        loading={loading}
        decoding="async"
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
