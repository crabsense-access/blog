"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { deleteAuthor } from "./actions";

export function DeleteAuthorButton({
  id,
  name,
  postCount,
  others,
  disabledReason,
}: {
  id: string;
  name: string;
  postCount: number;
  /** autores a los que se le puede pasar el contenido */
  others: { id: string; label: string }[];
  /** si viene, el botón queda deshabilitado con este motivo */
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (disabledReason) {
    return (
      <Button variant="ghost" size="icon" disabled title={disabledReason} aria-label={disabledReason}>
        <TrashIcon className="size-4" />
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setReassignTo("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Eliminar a ${name}`}>
          <TrashIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar autor</DialogTitle>
          <DialogDescription>
            Se va a eliminar a &quot;{name}&quot;. Si tiene usuario de login, ya no va a poder entrar al admin. No se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Label htmlFor={`reassign-${id}`}>
            Pasar su contenido a{postCount > 0 ? ` (${postCount} ${postCount === 1 ? "nota" : "notas"})` : ""}
          </Label>
          <select
            id={`reassign-${id}`}
            value={reassignTo}
            onChange={(e) => setReassignTo(e.target.value)}
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="">Dejar sin autor</option>
            {others.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Incluye sus notas, términos del glosario y posts de LinkedIn.
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteAuthor(id, reassignTo || null);
                if (res.error) setError(res.error);
                else setOpen(false);
              })
            }
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
