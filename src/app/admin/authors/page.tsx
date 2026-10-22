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
import { createClient } from "@/lib/supabase/server";
import { AuthorDialog } from "./author-dialog";
import { DeleteAuthorButton } from "./delete-author-button";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const supabase = await createClient();
  const [profiles, { data: postAuthors }, { data: { user } }] = await Promise.all([
    getAllProfilesForAdmin(),
    supabase.from("posts").select("author_id"),
    supabase.auth.getUser(),
  ]);
  const adminCount = profiles.filter((p) => p.role === "admin").length;
  const labelOf = (p: (typeof profiles)[number]) =>
    `${p.full_name ?? p.email ?? "Sin nombre"}${p.full_name && p.email ? ` (${p.email})` : ""}`;
  // cantidad de notas por autor (para distinguir perfiles con el mismo nombre)
  const postCount = new Map<string, number>();
  for (const p of postAuthors ?? []) {
    if (p.author_id) postCount.set(p.author_id, (postCount.get(p.author_id) ?? 0) + 1);
  }

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
            <TableHead>Email</TableHead>
            <TableHead>Notas</TableHead>
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
              <TableCell className="text-muted-foreground">{profile.email ?? "—"}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{postCount.get(profile.id) ?? 0}</TableCell>
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
                <DeleteAuthorButton
                  id={profile.id}
                  name={profile.full_name ?? profile.email ?? "este autor"}
                  postCount={postCount.get(profile.id) ?? 0}
                  others={profiles.filter((p) => p.id !== profile.id).map((p) => ({ id: p.id, label: labelOf(p) }))}
                  disabledReason={
                    profile.id === user?.id
                      ? "No podés eliminar tu propio perfil"
                      : profile.role === "admin" && adminCount <= 1
                        ? "Es el único admin"
                        : undefined
                  }
                />
              </TableCell>
            </TableRow>
          ))}
          {profiles.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Todavía no hay perfiles.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
