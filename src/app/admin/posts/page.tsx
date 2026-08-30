import Link from "next/link";
import { PlusIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllPostsForAdmin } from "@/lib/queries/posts";
import { DeletePostButton } from "./delete-post-button";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notas</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <PlusIcon />
            Nueva nota
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Actualizada</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{post.category?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={post.status === "published" ? "default" : "secondary"}>
                  {post.status === "published" ? "Publicada" : "Borrador"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(post.updated_at).toLocaleDateString("es-AR")}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/admin/posts/${post.id}`}>
                    <PencilIcon className="size-4" />
                  </Link>
                </Button>
                <DeletePostButton id={post.id} title={post.title} />
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Todavía no creaste ninguna nota.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
