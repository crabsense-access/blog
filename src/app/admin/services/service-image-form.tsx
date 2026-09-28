"use client";

import { useActionState } from "react";

import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceImage } from "@/lib/services";
import { useSuccessToast } from "@/lib/use-success-toast";
import { updateServiceImage, type ServiceImageFormState } from "./actions";

const initialState: ServiceImageFormState = {};

export function ServiceImageForm({
  slug,
  name,
  image,
}: {
  slug: string;
  name: string;
  image?: ServiceImage;
}) {
  const [state, formAction, pending] = useActionState(
    updateServiceImage.bind(null, slug),
    initialState
  );
  useSuccessToast(state, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold">{name}</h2>
      <ImageUploadField
        id={`image_file_${slug}`}
        name="image_file"
        label="Imagen"
        defaultImageUrl={image?.image_url}
        previewClassName="aspect-video max-w-sm"
      />
      <div className="grid gap-2">
        <Label htmlFor={`image_alt_${slug}`}>Texto alternativo</Label>
        <Input
          id={`image_alt_${slug}`}
          name="image_alt"
          maxLength={200}
          placeholder={`Ej.: Dashboard de ${name}`}
          defaultValue={image?.image_alt ?? ""}
        />
        <p className="text-sm text-muted-foreground">
          Describe la imagen para accesibilidad y SEO.
        </p>
      </div>
      {image?.image_url && (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="remove_image" />
          Quitar la imagen actual
        </label>
      )}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
