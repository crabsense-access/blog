import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TagPillProps {
  children: ReactNode;
  href?: string;
  tone?: "default" | "category" | "subcategory" | "action";
  // "solid": fondo relleno del color de categoría, texto blanco (uso por
  // defecto en el resto del sitio). "outline": borde de 2px + texto en el
  // color de categoría, fondo transparente — el mismo estilo que usan las
  // pills principales del slider y de los bloques de categoría. Además,
  // las "outline" tienen un relleno del color de categoría que entra
  // deslizando desde la izquierda al hacer hover (y se retrae por el mismo
  // lado al sacar el mouse) — ver bloque `outline` más abajo.
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

  // Las pills "outline" de categoría (post cards, Bloque Principal, header
  // del post, glosario, menú sticky de categorías del post) llevan el
  // efecto de relleno deslizante en hover. Usa un grupo con nombre
  // (group/pill) en vez de uno genérico para no pisarse con un `group` que
  // ya tenga el componente que envuelve a esta pill (ej. una card con su
  // propio hover de imagen).
  //
  // El color va como variable CSS (--pill-color) y --no-- como `style`
  // directo de `color`/`borderColor`: un estilo inline gana siempre sobre
  // cualquier clase, así que "hover:text-white" nunca podría pisar un
  // `style={{ color }}` puesto en el mismo elemento. Usando la variable +
  // clases arbitrarias de Tailwind para el color base, "hover:text-white"
  // sí puede ganar en hover.
  const content = outline ? (
    <span
      className={cn(
        "group/pill relative isolate inline-flex w-fit items-center gap-1 overflow-hidden whitespace-nowrap rounded-full border-2 bg-transparent px-3 py-1 text-xs font-bold uppercase",
        "[border-color:var(--pill-color)] [color:var(--pill-color)]",
        "transition-colors duration-300 hover:text-white",
        className
      )}
      style={{ "--pill-color": customColor || "#9ca3af" } as CSSProperties}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 -translate-x-full bg-[var(--pill-color)] transition-transform duration-300 ease-out group-hover/pill:translate-x-0"
      />
      <span className="relative inline-flex items-center gap-1">{children}</span>
    </span>
  ) : (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs uppercase transition-colors",
        tone === "category"
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
        customColor
          ? { backgroundColor: customColor, color: "#ffffff", borderColor: customColor }
          : undefined
      }
    >
      {children}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
