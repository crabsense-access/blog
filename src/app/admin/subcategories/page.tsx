import { Fragment } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories } from "@/lib/queries/categories";
import { getSubcategories } from "@/lib/queries/subcategories";
import type { Subcategory } from "@/lib/types";
import { SubcategoryDialog } from "./subcategory-dialog";
import { DeleteSubcategoryButton } from "./delete-subcategory-button";

export const dynamic = "force-dynamic";

export default async function AdminSubcategoriesPage() {
  const [categories, subcategories] = await Promise.all([
    getCategories(),
    getSubcategories(),
  ]);

  const subcategoriesByCategory = new Map<string, Subcategory[]>();
  for (const sub of subcategories) {
    const list = subcategoriesByCategory.get(sub.category_id) ?? [];
    list.push(sub);
    subcategoriesByCategory.set(sub.category_id, list);
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Subcategorías</h1>
        <SubcategoryDialog categories={categories} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const subs = subcategoriesByCategory.get(category.id) ?? [];
            return (
              <Fragment key={category.id}>
                <TableRow className="bg-muted/40">
                  <TableCell colSpan={2} className="font-semibold">
                    {category.name}
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <SubcategoryDialog
                      categories={categories}
                      defaultCategoryId={category.id}
                    />
                  </TableCell>
                </TableRow>
                {subs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="pl-8 text-sm">
                      <span className="mr-1.5 text-muted-foreground">↳</span>
                      {sub.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sub.slug}</TableCell>
                    <TableCell className="flex justify-end gap-1">
                      <SubcategoryDialog categories={categories} subcategory={sub} />
                      <DeleteSubcategoryButton id={sub.id} name={sub.name} />
                    </TableCell>
                  </TableRow>
                ))}
                {subs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="pl-8 text-sm text-muted-foreground">
                      Sin subcategorías todavía.
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Primero creá alguna categoría en /admin/categories.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
