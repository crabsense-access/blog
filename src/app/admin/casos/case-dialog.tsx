"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { useSuccessToast } from "@/lib/use-success-toast";
import { SUCCESS_CASE_SERVICES, type SuccessCase } from "@/lib/success-cases";
import { createSuccessCase, updateSuccessCase, type SuccessCaseFormState } from "./actions";

const initialState: SuccessCaseFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.[0] ? <p className="text-sm text-destructive">{errors[0]}</p> : null;
}

export function CaseDialog({ item }: { item?: SuccessCase }) {
  const [open, setOpen] = useState(false);
  const action = item ? updateSuccessCase.bind(null, item.id) : createSuccessCase;
  const [state, formAction, pending] = useActionState(action, initialState);

  useSuccessToast(state, initialState, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {item ? (
          <Button variant="ghost" size="icon">
            <PencilIcon className="size-4" />
          </Button>
        ) : (
          <Button>
            <PlusIcon />
            Nuevo caso
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar caso de éxito" : "Nuevo caso de éxito"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="client_name">Cliente</Label>
            <Input id="client_name" name="client_name" defaultValue={item?.client_name ?? ""} required />
            <FieldError errors={state.fieldErrors?.client_name} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              placeholder="Triplicamos las ventas online en 6 meses"
              defaultValue={item?.title ?? ""}
              required
            />
            <FieldError errors={state.fieldErrors?.title} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Qué problema tenía el cliente y qué hicimos."
              defaultValue={item?.description ?? ""}
            />
            <FieldError errors={state.fieldErrors?.description} />
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            <div className="grid gap-2">
              <Label htmlFor="metric_value">Resultado</Label>
              <Input id="metric_value" name="metric_value" placeholder="+180%" defaultValue={item?.metric_value ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metric_label">Detalle del resultado</Label>
              <Input
                id="metric_label"
                name="metric_label"
                placeholder="tráfico orgánico en 6 meses"
                defaultValue={item?.metric_label ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="service">Servicio</Label>
              <Select name="service" defaultValue={item?.service ?? "none"}>
                <SelectTrigger id="service" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin servicio</SelectItem>
                  {SUCCESS_CASE_SERVICES.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                min={0}
                defaultValue={item?.sort_order ?? 0}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link_url">Link (opcional)</Label>
            <Input
              id="link_url"
              name="link_url"
              placeholder="/blog/caso-cliente o empresa.com"
              defaultValue={item?.link_url ?? ""}
            />
            <FieldError errors={state.fieldErrors?.link_url} />
          </div>
          <ImageUploadField
            id="image_file"
            name="image_file"
            label="Imagen de fondo"
            defaultImageUrl={item?.image_url}
            previewClassName="h-28 w-auto max-w-full rounded object-cover"
            error={state.fieldErrors?.image_file?.[0]}
            required={!item}
          />
          <ImageUploadField
            id="logo_file"
            name="logo_file"
            label="Logo del cliente (opcional)"
            defaultImageUrl={item?.logo_url}
            previewClassName="h-14 w-auto max-w-48 rounded bg-neutral-800 object-contain p-2"
            error={state.fieldErrors?.logo_file?.[0]}
          />
          <p className="-mt-2 text-sm text-muted-foreground">
            Se muestra tal cual sobre la card (fondo oscuro), arriba del título. Ideal: versión clara o blanca del logo, en PNG o WebP con fondo transparente.
          </p>
          {item?.logo_url && (
            <label className="-mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="remove_logo" className="size-4" />
              Quitar el logo actual
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={item?.is_published ?? true}
              className="size-4"
            />
            Publicado (se muestra en la home)
          </label>
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
