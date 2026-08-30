import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTags } from "@/lib/queries/tags";
import { TagDialog } from "./tag-dialog";
import { DeleteTagButton } from "./delete-tag-button";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tags</h1>
        <TagDialog />
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
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="font-medium">{tag.name}</TableCell>
              <TableCell className="text-muted-foreground">{tag.slug}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <TagDialog tag={tag} />
                <DeleteTagButton id={tag.id} name={tag.name} />
              </TableCell>
            </TableRow>
          ))}
          {tags.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Todavía no creaste ningún tag.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
