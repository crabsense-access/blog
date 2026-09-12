"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/toc";

interface TableOfContentsProps {
  headings: TocHeading[];
}

function flattenIds(headings: TocHeading[]): string[] {
  return headings.flatMap((heading) => [heading.id, ...heading.children.map((child) => child.id)]);
}

/**
 * Índice de contenidos del post, generado a partir de los H2/H3 del
 * Markdown renderizado (ver src/lib/toc.ts). Sticky en la columna
 * izquierda, con el mismo comportamiento que el bloque izquierdo de la
 * página de categoría (CategoryPage), y resalta la sección visible con
 * IntersectionObserver.
 */
export function TableOfContents({ headings }: TableOfContentsProps) {
  const flatIds = flattenIds(headings);
  const [activeId, setActiveId] = useState<string | null>(flatIds[0] ?? null);

  useEffect(() => {
    const elements = flatIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const headerHeight = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--site-header-height")
    );
    // Banda de detección: justo debajo del header sticky, hasta el 30%
    // superior del viewport. Entre varios headings intersectando a la vez
    // (secciones cortas), nos quedamos con el más "avanzado" (top más
    // chico), que es la sección en la que el usuario está parado.
    const topOffset = (Number.isFinite(headerHeight) ? headerHeight : 72) + 16;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topMost = visible.reduce((closest, entry) =>
          entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest
        );
        setActiveId(topMost.target.id);
      },
      { rootMargin: `-${topOffset}px 0px -70% 0px`, threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]); // eslint-disable-line react-hooks/exhaustive-deps -- flatIds se deriva de headings

  if (flatIds.length < 2) return null;

  return (
    <nav
      aria-label="Índice de contenidos"
      className="sticky h-fit w-full"
      style={{ top: "calc(var(--site-header-height, 4.5rem) + 5%)" }}
    >
      <p className="font-heading mb-4 text-right text-xl lg:text-2xl">Contenidos</p>
      <ul className="space-y-2 border-r border-border text-right text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={() => setActiveId(heading.id)}
              className={cn(
                "-mr-px block border-r-2 border-transparent py-1 pr-4 transition-colors hover:text-foreground",
                activeId === heading.id
                  ? "border-foreground font-semibold text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {heading.text}
            </a>
            {heading.children.length > 0 && (
              <ul className="space-y-2">
                {heading.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      onClick={() => setActiveId(child.id)}
                      className={cn(
                        "-mr-px block border-r-2 border-transparent py-1 pr-8 text-[13px] transition-colors hover:text-foreground",
                        activeId === child.id
                          ? "border-foreground font-semibold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {child.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
