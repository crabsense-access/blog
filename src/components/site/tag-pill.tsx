import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TagPillProps {
  children: ReactNode;
  href?: string;
  tone?: "default" | "category" | "subcategory" | "action";
  // "solid": fondo relleno del color de categoría, texto blanco (uso por
  // defecto en el resto del sitio). "outline": borde de 2px + texto en el
  // color de categoría, fondo transparente — el mismo estilo que usan las
  // pills principales del slider y de los bloques de categoría.
  variant?: "solid" | "outline";
  color?: string | null;
  className?: string;
}

export function TagPill({
  children,
  href,
  tone = "default",
  variant = "solid",
  color,
  className,
}: TagPillProps) {
  const customColor = tone === "category" ? color : null;
  const outline = tone === "category" && variant === "outline";

  const content = (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs uppercase transition-colors",
        outline
          ? "border-2 bg-transparent font-bold"
          : tone === "category"
            ? customColor
              ? undefined
              : "bg-primary text-white hover:bg-primary/90"
            : tone === "subcategory"
              ? "bg-gray-100 px-4 text-gray-700 hover:bg-gray-200"
              : tone === "action"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-neutral-200 text-muted-foreground hover:bg-muted-foreground hover:text-muted",
        className
      )}
      style={
        outline
          ? { borderColor: customColor || "#9ca3af", color: customColor || "#9ca3af" }
          : customColor
            ? { backgroundColor: customColor, color: "#ffffff", borderColor: customColor }
            : undefined
      }
    >
      {children}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
