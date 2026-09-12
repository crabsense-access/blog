import { CategoryCard } from "@/components/site/category-card";
import type { Category, Subcategory } from "@/lib/types";

interface CategoryWithSubcategories {
  category: Category;
  subcategories: Subcategory[];
}

interface CategoriesSectionProps {
  categories: CategoryWithSubcategories[];
}

/**
 * Sección "Categorías" del home del blog: una card por cada categoría
 * principal (CategoryCard), con su pill arriba y el listado de pills de
 * sus subcategorías debajo. Las 4 cards comparten el mismo alto (el grid
 * las estira parejo a la más alta de la fila) sin importar cuántas
 * subcategorías tenga cada una.
 */
export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ category, subcategories }) => (
          <CategoryCard key={category.id} category={category} subcategories={subcategories} />
        ))}
      </div>
    </section>
  );
}
