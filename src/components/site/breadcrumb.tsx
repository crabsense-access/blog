import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb jerárquico (Inicio > Blog > Categoría > ... > página actual).
 * El último item siempre se muestra como texto plano, sin link, sin
 * importar si trae `href` — representa la página actual. Todos los niveles
 * van en mayúsculas excepto el último, que respeta las mayúsculas/
 * minúsculas originales del título del post.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={cn("flex items-center", !isLast && "uppercase")}>
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="-mt-px mx-2.5 flex items-center text-lg leading-none"
                >
                  ›
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
