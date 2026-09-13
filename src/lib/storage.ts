import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Formato no soportado: subí un JPG, PNG o WebP.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen no puede pesar más de 5MB.";
  }
  return null;
}

/**
 * Sube una imagen a un bucket público de Supabase Storage y devuelve su
 * URL pública. Usado por todos los campos de imagen del admin (portada de
 * post, foto de autor, fondo de categoría/subcategoría, logo de cliente)
 * para no duplicar la validación ni el path-naming en cada actions.ts.
 */
export async function uploadPublicImage(
  supabase: SupabaseClient<Database>,
  bucket: string,
  file: File,
  pathPrefix?: string
): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const ext = EXT_BY_MIME[file.type] ?? file.name.split(".").pop() ?? "jpg";
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = pathPrefix ? `${pathPrefix}-${uniqueSuffix}.${ext}` : `${uniqueSuffix}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
