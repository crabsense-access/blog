import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button asChild variant="outline" size="sm" disabled={page <= 1}>
        <Link href={`${basePath}?page=${page - 1}`} aria-disabled={page <= 1}>
          Anterior
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
        <Link href={`${basePath}?page=${page + 1}`} aria-disabled={page >= totalPages}>
          Siguiente
        </Link>
      </Button>
    </div>
  );
}
