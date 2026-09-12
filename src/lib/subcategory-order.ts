import type { Subcategory } from "@/lib/types";

export interface OrderedSubcategory {
  subcategory: Subcategory;
  active: boolean;
}

// Ordena las subcategorías de una nota para su visualización: si hay una
// subcategoría "activa" (el contexto actual está filtrado por ella, ej. un
// carrusel o la página de esa subcategoría), va primero y marcada como
// `active` para destacarla en negrita; el resto sigue en su orden habitual.
export function orderSubcategoriesForDisplay(
  subcategories: Subcategory[],
  activeSubcategorySlug?: string
): OrderedSubcategory[] {
  const active = activeSubcategorySlug
    ? subcategories.find((sub) => sub.slug === activeSubcategorySlug)
    : undefined;

  if (!active) {
    return subcategories.map((subcategory) => ({ subcategory, active: false }));
  }

  const rest = subcategories.filter((sub) => sub.id !== active.id);
  return [
    { subcategory: active, active: true },
    ...rest.map((subcategory) => ({ subcategory, active: false })),
  ];
}
