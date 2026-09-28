"use server";

import { revalidatePath } from "next/cache";

import { SERVICE_LIST } from "@/lib/services";
import { uploadPublicImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export interface ServiceImageFormState {
  error?: string;
  ok?: boolean;
}

export async function updateServiceImage(
  slug: string,
  _prevState: ServiceImageFormState,
  formData: FormData
): Promise<ServiceImageFormState> {
  if (!SERVICE_LIST.some((s) => s.slug === slug)) return { error: "Servicio inválido." };

  const supabase = await createClient();
  const alt = String(formData.get("image_alt") ?? "").trim().slice(0, 200);
  const update: Record<string, unknown> = { slug, image_alt: alt || null };

  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    try {
      update.image_url = await uploadPublicImage(supabase, "service-images", file, slug);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }
  if (formData.get("remove_image") === "on") update.image_url = null;

  const { error } = await supabase.from("service_images").upsert(update, { onConflict: "slug" });
  if (error) return { error: error.message };

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { ok: true };
}
