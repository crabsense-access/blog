"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CategoryPillCircleFillProps {
  children: ReactNode;
  color?: string | null;
  href?: string;
  className?: string;
}

/**
 * Pill "outline" de categoría (borde de 2px + texto en el color de
 * categoría, fondo transparente por defecto) con el mecanismo de hover de
 * https://codepen.io/alticreation/pen/zBZwOP ("Pure Css Button Hover
 * effect"): el relleno nace pegado al borde izquierdo con ancho 0 y crece
 * en `width` hasta cubrir el 100% de la pill, usando el MISMO color que
 * el borde (sin oscurecer) -- al terminar el hover queda sólida de ese
 * color con el texto en blanco para mantener contraste.
 *
 * A propósito NO vive dentro de TagPill: el pedido fue solo para las
 * pills principales del slider de la home (home-hero-slider.tsx) y del
 * menú sticky de categorías (post-categories-sticky-nav.tsx), sin tocar
 * el efecto de slide que sigue usando el resto del sitio (post cards,
 * header del post, glosario, etc.) a través de TagPill.
 */
export function CategoryPillCircleFill({
  children,
  color,
  href,
  className,
}: CategoryPillCircleFillProps) {
  const content = (
    <span
      className={cn(
        "group/pill relative isolate inline-flex w-fit items-center gap-1 overflow-hidden whitespace-nowrap rounded-full border-2 bg-transparent px-3 py-1 text-xs font-bold uppercase",
        "[border-color:var(--pill-color)] [color:var(--pill-color)]",
        "transition-colors duration-300 hover:text-white",
        className
      )}
      style={{ "--pill-color": color || "#9ca3af" } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 -z-10 w-0 bg-[var(--pill-color)] transition-[width] duration-300 ease-out group-hover/pill:w-full"
      />
      <span className="relative inline-flex items-center gap-1">{children}</span>
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
