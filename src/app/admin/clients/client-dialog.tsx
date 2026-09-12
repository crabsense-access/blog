"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSuccessToast } from "@/lib/use-success-toast";
import type { Client } from "@/lib/types";
import { createClientLogo, updateClientLogo, type ClientFormState } from "./actions";

const initialState: ClientFormState = {};

interface ClientDialogProps {
  client?: Client;
}

export function ClientDialog({ client }: ClientDialogProps) {
  const [open, setOpen] = useState(false);
  const action = client ? updateClientLogo.bind(null, client.id) : createClientLogo;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [preview, setPreview] = useState<string | null>(client?.logo_url ?? null);

  useSuccessToast(state, initialState, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon">
            <PencilIcon className="size-4" />
          </Button>
        ) : (
          <Button>
            <PlusIcon />
            Nuevo cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={client?.name ?? ""} required />
            {state.fieldErrors?.name && (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="row_number">Fila del carrusel</Label>
            <Select name="row_number" defaultValue={String(client?.row_number ?? 1)}>
              <SelectTrigger id="row_number" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Fila 1</SelectItem>
                <SelectItem value="2">Fila 2</SelectItem>
                <SelectItem value="3">Fila 3</SelectItem>
              </SelectContent>
            </Select>
            {state.fieldErrors?.row_number && (
              <p className="text-sm text-destructive">{state.fieldErrors.row_number[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logo_file">Logo</Label>
            <Input
              id="logo_file"
              name="logo_file"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Vista previa del logo"
                className="h-12 w-auto max-w-40 object-contain"
              />
            )}
            {state.fieldErrors?.logo_file && (
              <p className="text-sm text-destructive">{state.fieldErrors.logo_file[0]}</p>
            )}
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
