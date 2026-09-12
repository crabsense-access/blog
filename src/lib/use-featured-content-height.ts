"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Debe coincidir con el gap-4 (1rem) del root de FeaturedPostContent,
// el espacio fijo entre el bloque título/excerpt y el bloque autor/fecha.
const FEATURED_CONTENT_ROOT_GAP = 16;

/**
 * Mide dinámicamente el alto del bloque de contenido del item destacado
 * (desde el techo del título hasta el piso del bloque autor/fecha,
 * excluyendo imagen y pills) para aplicarlo como altura de los items
 * horizontales del Bloque Principal (MainBlockHorizontalItem).
 *
 * Si `includeExcerpt` es false, calcula la altura sin contar el espacio
 * que ocupa el excerpt del destacado (solo título + gap fijo + autor/fecha),
 * para items horizontales que no muestran excerpt.
 */
export function useFeaturedContentHeight(dependency: string, includeExcerpt = true) {
  const titleRef = useRef<HTMLAnchorElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const titleEl = titleRef.current;
    const authorEl = authorRef.current;
    if (!titleEl || !authorEl) return;

    function measure() {
      if (!titleEl || !authorEl) return;
      const authorRect = authorEl.getBoundingClientRect();
      if (includeExcerpt) {
        const top = titleEl.getBoundingClientRect().top;
        setHeight(authorRect.bottom - top);
      } else {
        const titleHeight = titleEl.getBoundingClientRect().height;
        const authorHeight = authorRect.height;
        setHeight(titleHeight + FEATURED_CONTENT_ROOT_GAP + authorHeight);
      }
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(titleEl);
    observer.observe(authorEl);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, includeExcerpt]);

  return { titleRef, authorRef, height };
}
