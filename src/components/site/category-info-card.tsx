import { TagPill } from "@/components/site/tag-pill";
import { cn } from "@/lib/utils";
import type { Category, Subcategory } from "@/lib/types";

interface CategoryInfoCardProps {
  category: Category;
  subcategory?: Subcategory;
  siblingSubcategories?: Subcategory[];
  otherCategories?: Category[];
  className?: string;
}

/**
 * Tarjeta de info usada en el Bloque Principal de las páginas de
 * categoría y de subcategoría. Con `subcategory` muestra
 * "[Categoría] / [Subcategoría]" y lista las subcategorías hermanas en
 * "Otras categorías"; sin `subcategory` muestra solo el nombre de la
 * categoría principal y lista las demás categorías del sitio.
 */
export function CategoryInfoCard({
  category,
  subcategory,
  siblingSubcategories = [],
  otherCategories = [],
  className,
}: CategoryInfoCardProps) {
  const otherItems = subcategory
    ? siblingSubcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        href: `/blog/categoria/${category.slug}/${sub.slug}`,
      }))
    : otherCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        href: `/blog/categoria/${cat.slug}`,
      }));

  return (
    <div className={cn("flex h-full flex-col justify-end gap-4", className)}>
      <div className="flex flex-col justify-end gap-3 p-6 pt-5 pb-1 pl-0">
        <p className="flex flex-wrap items-center gap-x-2">
          <TagPill
            tone="category"
            color={category.pill_color}
            href={`/blog/categoria/${category.slug}`}
            className="text-2xl font-bold"
          >
            {category.name}
          </TagPill>
          {subcategory && (
            <TagPill
              tone="category"
              color={subcategory.pill_color}
              className="text-2xl font-bold"
            >
              {subcategory.name}
            </TagPill>
          )}
        </p>
      </div>

      {otherItems.length > 0 && (
        <>
          <div className="my-2 border-t border-gray-200" />
          <div className="pt-2 pb-2">
            <p className="pb-2 pl-2 text-sm font-bold uppercase">Más categorías de {category.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {otherItems.map((item) => (
                <TagPill key={item.id} tone="subcategory" href={item.href} className="text-sm">
                  {item.name}
                </TagPill>
              ))}
            </div>
          </div>
          <div className="mt-2 border-t border-gray-200" />
        </>
      )}
    </div>
  );
}
