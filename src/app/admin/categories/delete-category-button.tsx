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
import { deleteCategory } from "./actions";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
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
          <DialogTitle>Eliminar categoría</DialogTitle>
          <DialogDescription>
            Las notas con la categoría &quot;{name}&quot; quedarán sin categoría.
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
                await deleteCategory(id);
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
