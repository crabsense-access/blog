"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { PencilIcon, ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GLOSSARY_CATEGORY_LABELS } from "@/lib/validations/glossary";
import { DeleteGlossaryTermButton } from "./delete-glossary-term-button";
import type { GlossaryCategory, GlossaryTermWithRelations } from "@/lib/types";

type SortColumn = "term" | "status" | "updated_at";
type SortDirection = "asc" | "desc";
type CategoryFilter = GlossaryCategory | "all";

const CATEGORIES: GlossaryCategory[] = ["ga4", "ads", "ia", "seo"];

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return <ArrowUpDownIcon className="size-3.5 text-muted-foreground/50" />;
  return direction === "asc" ? (
    <ArrowUpIcon className="size-3.5" />
  ) : (
    <ArrowDownIcon className="size-3.5" />
  );
}

interface SortableHeadProps {
  column: SortColumn;
  activeColumn: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  children: ReactNode;
}

function SortableHead({ column, activeColumn, direction, onSort, children }: SortableHeadProps) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="flex items-center gap-1.5 font-medium hover:text-foreground"
      >
        {children}
        <SortIcon active={activeColumn === column} direction={direction} />
      </button>
    </TableHead>
  );
}

interface GlossaryTermsTableProps {
  terms: GlossaryTermWithRelations[];
}

export function GlossaryTermsTable({ terms }: GlossaryTermsTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  // Mismo orden que ya traía la query por defecto (updated_at desc), para
  // que la tabla se vea igual antes de tocar ningún header.
  const [sortColumn, setSortColumn] = useState<SortColumn>("updated_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  function toggleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const visibleTerms = useMemo(() => {
    const filtered =
      categoryFilter === "all" ? terms : terms.filter((term) => term.category === categoryFilter);

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "term") {
        comparison = a.term.localeCompare(b.term, "es");
      } else if (sortColumn === "status") {
        comparison = a.status.localeCompare(b.status);
      } else {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [terms, categoryFilter, sortColumn, sortDirection]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead column="term" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
            Término
          </SortableHead>
          <TableHead>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
            >
              <SelectTrigger className="h-8 w-auto gap-1.5 border-none px-0 font-medium shadow-none hover:text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {GLOSSARY_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableHead>
          <SortableHead column="status" activeColumn={sortColumn} direction={sortDirection} onSort={toggleSort}>
            Estado
          </SortableHead>
          <SortableHead
            column="updated_at"
            activeColumn={sortColumn}
            direction={sortDirection}
            onSort={toggleSort}
          >
            Actualizado
          </SortableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleTerms.map((term) => (
          <TableRow key={term.id}>
            <TableCell className="font-medium">
              <Link
                href={`/glosario/${term.category}/${term.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {term.term}
              </Link>
            </TableCell>
            <TableCell>
              <Link
                href={`/glosario/${term.category}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {GLOSSARY_CATEGORY_LABELS[term.category]}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={term.status === "published" ? "default" : "secondary"}>
                {term.status === "published" ? "Publicado" : "Borrador"}
              </Badge>
            </TableCell>
            <TableCell>{new Date(term.updated_at).toLocaleDateString("es-AR")}</TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button asChild variant="ghost" size="icon">
                <Link href={`/admin/glosario/${term.id}`}>
                  <PencilIcon className="size-4" />
                </Link>
              </Button>
              <DeleteGlossaryTermButton id={term.id} term={term.term} />
            </TableCell>
          </TableRow>
        ))}
        {visibleTerms.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              {terms.length === 0
                ? "Todavía no cargaste ningún término."
                : "No hay términos en esta categoría."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
