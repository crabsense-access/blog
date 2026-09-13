"use client";

import { useState, type ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/storage";

interface ImageUploadFieldProps {
  id: string;
  name: string;
  label: string;
  defaultImageUrl?: string | null;
  previewClassName?: string;
  error?: string;
  required?: boolean;
}

/**
 * Campo de subida de imagen reutilizado por todo el admin (portada de
 * post, foto de autor, fondo de categoría/subcategoría, logo de cliente):
 * input de archivo + preview + validación de tipo/tamaño en el cliente
 * (la validación real, que no se puede confiar del lado del cliente, vive
 * en src/lib/storage.ts y corre de nuevo en el server action).
 */
export function ImageUploadField({
  id,
  name,
  label,
  defaultImageUrl,
  previewClassName,
  error,
  required,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(defaultImageUrl ?? null);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setClientError("Formato no soportado: subí un JPG, PNG o WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setClientError("La imagen no puede pesar más de 5MB.");
      e.target.value = "";
      return;
    }

    setClientError(null);
    setPreview(URL.createObjectURL(file));
  }

  const displayedError = clientError || error;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Vista previa"
          className={cn("w-full max-w-xs rounded object-cover", previewClassName)}
        />
      )}
      <Input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={required && !defaultImageUrl}
        onChange={handleChange}
      />
      <p className="text-xs text-muted-foreground">JPG, PNG o WebP — máximo 5MB.</p>
      {displayedError && <p className="text-sm text-destructive">{displayedError}</p>}
    </div>
  );
}
