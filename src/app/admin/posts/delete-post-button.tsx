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
import { deletePost } from "./actions";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <TrashIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar nota</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se va a eliminar &quot;{title}&quot;
            de forma permanente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await deletePost(id);
                setOpen(false);
              })
            }
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
