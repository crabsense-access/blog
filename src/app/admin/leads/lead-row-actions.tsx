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
import type { LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { deleteLead, updateLeadStatus } from "./actions";

const STATUS_STYLES: Record<LeadStatus, string> = {
  nuevo: "border-[#53539b]/30 bg-[#53539b]/10 text-[#3d3c89]",
  contactado: "border-emerald-300 bg-emerald-50 text-emerald-800",
  descartado: "border-neutral-200 bg-neutral-100 text-neutral-500",
};

export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={isPending}
      aria-label="Estado"
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        const prev = value;
        setValue(next);
        startTransition(async () => {
          const res = await updateLeadStatus(id, next);
          if (res.error) setValue(prev);
        });
      }}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium capitalize disabled:opacity-60",
        STATUS_STYLES[value]
      )}
    >
      <option value="nuevo">Nuevo</option>
      <option value="contactado">Contactado</option>
      <option value="descartado">Descartado</option>
    </select>
  );
}

export function DeleteLeadButton({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Eliminar contacto">
          <TrashIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar contacto</DialogTitle>
          <DialogDescription>Se va a borrar el contacto de &quot;{label}&quot;.</DialogDescription>
        </DialogHeader>
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
                const res = await deleteLead(id);
                if (res.error) setError(res.error);
                else setOpen(false);
              })
            }
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
