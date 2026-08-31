"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface PostImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function PostImage({ src, alt, className }: PostImageProps) {
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
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
