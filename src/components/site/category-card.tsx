import { TagPill } from "@/components/site/tag-pill";
import { orderSubcategoriesForDisplay } from "@/lib/subcategory-order";
import { cn } from "@/lib/utils";
import type { Category, Subcategory } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
  subcategories: Subcategory[];
  // Si coincide con el slug de una subcategoría, esa pill se resalta
  // (fondo gris oscuro + texto blanco) — usado en la página de esa
  // subcategoría para marcar cuál está seleccionada.
  activeSubcategorySlug?: string;
  // Imagen de fondo a mostrar en el placeholder — por defecto usa
  // category.image_url. La página de subcategoría pasa explícitamente
  // subcategory.image_url para mostrar la imagen propia de la
  // subcategoría en vez de la de su categoría padre (incluso si es null,
  // en cuyo caso cae al placeholder gris, sin heredar la de la categoría).
  imageUrl?: string | null;
  className?: string;
  // Overrides opcionales — sin usarlos, la card se ve igual que siempre
  // (grilla "Categorías" de la home). La página de categoría/subcategoría
  // los usa para igualar sus pills con las de los items horizontales de
  // la derecha (MainBlockHorizontalItem) y para agrandar el bloque de la
  // imagen.
  imageClassName?: string;
  subcategoryPillClassName?: string;
  subcategoryContainerClassName?: string;
}

function Pill({ label, color }: { label: string; color?: string | null }) {
  return (
    <span
      className="ml-[1%] mr-[2%] inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border-2 bg-transparent px-4 py-1 text-base font-bold uppercase"
      style={{
        borderColor: color || "#9ca3af",
        color: color || "#9ca3af",
      }}
    >
      {label}
    </span>
  );
}

/**
 * Card de categoría: placeholder de imagen + pill principal arriba, pills
 * de subcategorías debajo. Usada en la grilla "Categorías" de la home del
 * blog (CategoriesSection) y, sola, en la página de cada categoría.
 */
export function CategoryCard({
  category,
  subcategories,
  activeSubcategorySlug,
  imageUrl,
  className,
  imageClassName,
  subcategoryPillClassName,
  subcategoryContainerClassName,
}: CategoryCardProps) {
  const orderedSubcategories = orderSubcategoriesForDisplay(subcategories, activeSubcategorySlug);
  const resolvedImageUrl = imageUrl !== undefined ? imageUrl : category.image_url;

  return (
    <div className={cn("flex h-full flex-col gap-4 rounded-2xl px-4 py-6", className)}>
      {/* Imagen de fondo configurada desde el admin; sin ella, cae al
          placeholder gris. */}
      <div
        className={cn(
          "relative -mx-4 -mt-6 flex h-32 items-end rounded-t-2xl bg-gray-100 bg-cover bg-center p-4",
          imageClassName
        )}
        style={resolvedImageUrl ? { backgroundImage: `url(${resolvedImageUrl})` } : undefined}
      >
        <Pill label={category.name} color={category.pill_color} />
      </div>

      {subcategories.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap content-start gap-3 rounded-lg bg-gray-50/50 py-3",
            subcategoryContainerClassName
          )}
        >
          {orderedSubcategories.map(({ subcategory: sub, active }) => (
            <TagPill
              key={sub.id}
              tone="subcategory"
              href={`/blog/categoria/${category.slug}/${sub.slug}`}
              className={cn(
                "border-2 border-gray-100 text-[13px] font-medium hover:bg-gray-100",
                subcategoryPillClassName,
                active && "border-gray-900 bg-gray-900 text-white hover:border-gray-900 hover:bg-gray-900 hover:text-white"
              )}
            >
              {sub.name}
            </TagPill>
          ))}
        </div>
      )}
    </div>
  );
}
