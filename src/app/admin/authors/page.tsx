import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { AuthorDialog } from "./author-dialog";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const profiles = await getAllProfilesForAdmin();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Autores</h1>
        <p className="text-sm text-muted-foreground">
          Perfiles de admin/editores y autores solo de contenido para las notas del blog.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cargo público</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Experto destacado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">
                {profile.full_name ?? profile.email ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {profile.public_title ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{profile.role}</TableCell>
              <TableCell>
                {profile.is_featured_expert ? (
                  <Badge variant="secondary">Posición {profile.featured_position ?? "—"}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <AuthorDialog profile={profile} />
              </TableCell>
            </TableRow>
          ))}
          {profiles.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Todavía no hay perfiles.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
