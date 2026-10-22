import Link from "next/link";
import { PencilIcon, PlusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FORMAT_LABELS, LINKEDIN_TYPES, LINKEDIN_TYPE_ORDER, STATUS_LABELS } from "@/lib/linkedin";
import { getAllLinkedInPostsForAdmin } from "@/lib/queries/linkedin";
import { DeleteLinkedInPostButton } from "./delete-linkedin-post-button";
import { LinkedInNav } from "./linkedin-nav";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = { draft: "outline", approved: "secondary", published: "default" } as const;

export default async function AdminLinkedInPage() {
  const posts = await getAllLinkedInPostsForAdmin();

  return (
    <div className="grid gap-8">
      <div className="grid gap-4">
        <h1 className="text-2xl font-semibold">LinkedIn</h1>
        <LinkedInNav />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Generá, revisá y exportá posts con el estilo de Crabsense. Se publican a mano en LinkedIn.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/linkedin/new">
            <PlusIcon />
            Nuevo post
          </Link>
        </Button>
      </div>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Empezar por tipo</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LINKEDIN_TYPE_ORDER.map((t) => {
            const c = LINKEDIN_TYPES[t];
            return (
              <Link
                key={t}
                href={`/admin/linkedin/new?type=${t}`}
                className="grid gap-1 rounded-lg border p-4 transition-colors hover:border-[#53539b]"
              >
                <span className="text-xs font-semibold tracking-widest text-[#3e787e]">
                  {c.numeral} · {FORMAT_LABELS[c.defaultFormat]}
                </span>
                <span className="font-semibold">{c.label}</span>
                <span className="text-sm text-muted-foreground">{c.description}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Posts</h2>
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Todavía no hay posts. Elegí un tipo arriba para generar el primero.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha prevista</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[360px] truncate font-medium">
                      <Link href={`/admin/linkedin/${p.id}`} className="hover:underline">
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell>{LINKEDIN_TYPES[p.type]?.short ?? p.type}</TableCell>
                    <TableCell>{FORMAT_LABELS[p.format]}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {p.scheduled_for
                        ? new Date(`${p.scheduled_for}T12:00:00`).toLocaleDateString("es-AR")
                        : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString("es-AR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" aria-label="Editar">
                          <Link href={`/admin/linkedin/${p.id}`}>
                            <PencilIcon className="size-4" />
                          </Link>
                        </Button>
                        <DeleteLinkedInPostButton id={p.id} title={p.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
