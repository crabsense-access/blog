import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { TagPill } from "@/components/site/tag-pill";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { orderSubcategoriesForDisplay } from "@/lib/subcategory-order";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";

interface MainBlockHorizontalItemProps {
  post: PostWithRelations;
  height?: number | null;
  flexShare?: boolean;
  activeSubcategorySlug?: string;
  showExcerpt?: boolean;
  // Overrides opcionales de tamaño — sin usarlos, el item se ve igual que
  // en el Bloque Principal de la home. Las páginas de categoría/
  // subcategoría los usan para agrandar apenas el título y el bloque de
  // autor/fecha.
  titleClassName?: string;
  authorNameClassName?: string;
  metaClassName?: string;
  // Override del contenedor raíz — lo usa la página de categoría/
  // subcategoría para anular el pt-2 del primer item y que su imagen
  // quede alineada exactamente con la del bloque de categoría de al lado.
  className?: string;
}

/**
 * Bloque Principal Horizontal — item horizontal de referencia usado en la
 * columna derecha del Bloque Principal (home del blog, página de autor y
 * página de categoría/subcategoría).
 *
 * Dos modos de alto:
 * - Medido (default): la altura se calcula en el componente padre (título +
 *   excerpt + autor/fecha del destacado acompañante) y se pasa vía `height`;
 *   el padre es responsable de orientarlo hacia abajo (mt-auto).
 * - `flexShare`: el item usa flex-1 (flex: 1 1 0) para repartirse en partes
 *   iguales el alto disponible del contenedor junto a sus hermanos, en vez
 *   de un alto fijo; ignora `height`.
 */
export function MainBlockHorizontalItem({
  post,
  height,
  flexShare = false,
  activeSubcategorySlug,
  showExcerpt = true,
  titleClassName,
  authorNameClassName,
  metaClassName,
  className,
}: MainBlockHorizontalItemProps) {
  const authorLabel = post.author?.full_name || post.author?.email;
  const category = post.category;
  const orderedSubcategories = orderSubcategoriesForDisplay(
    post.subcategories,
    activeSubcategorySlug
  );

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden px-4 pb-4 pt-2",
        flexShare ? "min-h-0 flex-1" : "min-h-64",
        className
      )}
      style={!flexShare && height ? { height } : undefined}
    >
      {/* Nunca h-full acá: el grid siempre se dimensiona por su contenido
          (columna de texto), y la imagen se estira sola para igualarlo vía
          el stretch por defecto de CSS Grid. Es intencional incluso con
          flexShare — si ese contenedor flex-1 termina más alto que el
          contenido (ej. un solo item ocupando todo el bloque de 100vh), el
          sobrante queda en blanco debajo en vez de estirar la imagen más
          allá de su alto de contenido. */}
      <div className="grid grid-cols-[12rem_1fr] gap-x-6 gap-y-4">
        <PostImage
          src={post.cover_image_url}
          alt={post.title}
          className="row-start-1 w-full rounded"
        />

        <div className="row-start-1 flex min-w-0 flex-col justify-start gap-4">
          <div className="mt-2 flex min-h-7 flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {category && (
              <>
                <TagPill tone="category" variant="outline" color={category.pill_color} href={`/blog/categoria/${category.slug}`} className="mr-[2%] px-4 py-1 text-base">
                  {category.name}
                </TagPill>
                {orderedSubcategories.map(({ subcategory: sub, active }) => (
                  <TagPill
                    key={sub.id}
                    tone="subcategory"
                    href={`/blog/categoria/${category.slug}/${sub.slug}`}
                    className={cn(
                      "border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-400 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600",
                      active && "bg-gray-800 text-white hover:border-gray-700 hover:bg-gray-700"
                    )}
                  >
                    {sub.name}
                  </TagPill>
                ))}
              </>
            )}
          </div>

          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {/* Mismo font-family/weight que el h2 del destacado
                (FeaturedPostContent): font-heading, sin peso explícito
                (hereda "normal", igual que ese h2), pero un tamaño más
                chico (text-2xl lg:text-3xl vs. text-3xl lg:text-4xl).
                min-h reserva 2 líneas al line-height más alto (lg:text-3xl
                = 2.25rem × 2 = 4.5rem) para que no salte de alto entre
                breakpoints. */}
            <h3
              className={cn(
                "font-heading line-clamp-2 min-h-18 text-2xl lg:text-3xl",
                titleClassName
              )}
            >
              {post.title}
            </h3>
          </Link>

          {showExcerpt && post.excerpt && (
            <p className="font-excerpt line-clamp-2 text-lg text-muted-foreground">{post.excerpt}</p>
          )}

          <div className="flex items-end justify-between gap-2 pt-4">
            {authorLabel ? (
              <div className="flex items-center gap-2">
                <AuthorAvatar author={post.author ?? {}} />
                <div className="flex flex-col leading-tight">
                  <Link
                    href={`/blog/autor/${post.author?.id}`}
                    className={cn(
                      "text-sm font-medium text-foreground hover:underline",
                      authorNameClassName
                    )}
                  >
                    {authorLabel}
                  </Link>
                  {post.author?.public_title && (
                    <span className={cn("text-xs uppercase text-muted-foreground", metaClassName)}>
                      {post.author.public_title}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div />
            )}
            {post.published_at && (
              <span className={cn("text-xs uppercase text-muted-foreground", metaClassName)}>
                {new Date(post.published_at).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
