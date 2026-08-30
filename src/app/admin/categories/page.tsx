import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories } from "@/lib/queries/categories";
import { CategoryDialog } from "./category-dialog";
import { DeleteCategoryButton } from "./delete-category-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <CategoryDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="text-muted-foreground">{category.slug}</TableCell>
              <TableCell className="text-muted-foreground">
                {category.description ?? "—"}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <CategoryDialog category={category} />
                <DeleteCategoryButton id={category.id} name={category.name} />
              </TableCell>
            </TableRow>
          ))}
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Todavía no creaste ninguna categoría.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
