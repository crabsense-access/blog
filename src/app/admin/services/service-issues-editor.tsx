"use client";

import { useActionState, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceIssueRow } from "@/lib/services";
import { useSuccessToast } from "@/lib/use-success-toast";
import {
  createServiceIssue,
  deleteServiceIssue,
  updateServiceIssue,
  type ServiceIssueFormState,
} from "./actions";

const initialState: ServiceIssueFormState = {};

/**
 * Problemas ("issues") de un servicio: las cards apiladas de la home con
 * título, descripción y bullets de "Cómo te ayudamos".
 */
export function ServiceIssuesEditor({
  slug,
  name,
  issues,
}: {
  slug: string;
  name: string;
  issues: ServiceIssueRow[];
}) {
  const [adding, setAdding] = useState(false);
  const nextOrder = issues.length ? Math.max(...issues.map((i) => i.sort_order)) + 1 : 0;

  return (
    <div className="grid gap-4 rounded-lg border p-6">
      <div>
        <h2 className="text-lg font-semibold">{name} · Problemas</h2>
        <p className="text-sm text-muted-foreground">
          Cards de &quot;Problema 01, 02…&quot; de este servicio en la home, ordenadas por
          &quot;Orden&quot;.
          {issues.length === 0 &&
            " Sin problemas cargados: la home muestra los que vienen por defecto en el código."}
        </p>
      </div>

      {issues.map((issue, i) => (
        <IssueForm key={issue.id} issue={issue} index={i} />
      ))}

      {adding ? (
        <NewIssueForm slug={slug} sortOrder={nextOrder} onDone={() => setAdding(false)} />
      ) : (
        <Button type="button" variant="outline" className="w-fit" onClick={() => setAdding(true)}>
          + Agregar problema
        </Button>
      )}
    </div>
  );
}

function IssueFields({
  idPrefix,
  issue,
  sortOrder,
}: {
  idPrefix: string;
  issue?: ServiceIssueRow;
  sortOrder: number;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}_title`}>Título</Label>
          <Input
            id={`${idPrefix}_title`}
            name="title"
            required
            maxLength={200}
            defaultValue={issue?.title ?? ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}_sort`}>Orden</Label>
          <Input
            id={`${idPrefix}_sort`}
            name="sort_order"
            type="number"
            defaultValue={issue?.sort_order ?? sortOrder}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}_description`}>Descripción</Label>
        <Textarea
          id={`${idPrefix}_description`}
          name="description"
          rows={3}
          maxLength={1000}
          defaultValue={issue?.description ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}_help`}>Cómo te ayudamos</Label>
        <Textarea
          id={`${idPrefix}_help`}
          name="help"
          rows={4}
          defaultValue={issue?.help.join("\n") ?? ""}
        />
        <p className="text-sm text-muted-foreground">Un bullet por línea.</p>
      </div>
    </>
  );
}

function IssueForm({ issue, index }: { issue: ServiceIssueRow; index: number }) {
  const [state, formAction, pending] = useActionState(
    updateServiceIssue.bind(null, issue.id),
    initialState
  );
  useSuccessToast(state, initialState);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <form action={formAction} className="grid gap-4 rounded-md border bg-muted/30 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Problema {String(index + 1).padStart(2, "0")}
      </p>
      <IssueFields idPrefix={`issue_${issue.id}`} issue={issue} sortOrder={issue.sort_order} />
      {(state.error || deleteError) && (
        <p className="text-sm text-destructive">{state.error ?? deleteError}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || deleting}>
          {pending ? "Guardando..." : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-destructive"
          disabled={pending || deleting}
          onClick={() => {
            if (!window.confirm(`¿Eliminar "${issue.title}"?`)) return;
            startDelete(async () => {
              const res = await deleteServiceIssue(issue.id);
              setDeleteError(res.error ?? null);
            });
          }}
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </form>
  );
}

function NewIssueForm({
  slug,
  sortOrder,
  onDone,
}: {
  slug: string;
  sortOrder: number;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createServiceIssue.bind(null, slug),
    initialState
  );
  useSuccessToast(state, initialState, onDone);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 rounded-md border border-dashed p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Nuevo problema
      </p>
      <IssueFields idPrefix={`new_${slug}`} sortOrder={sortOrder} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Agregar"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
