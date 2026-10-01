"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { uploadPublicImage } from "@/lib/storage";
import { successCaseFormSchema } from "@/lib/validations/success-case";

const BUCKET = "success-cases";

export interface SuccessCaseFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parse(formData: FormData) {
  return successCaseFormSchema.safeParse({
    client_name: formData.get("client_name"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    metric_value: formData.get("metric_value") ?? "",
    metric_label: formData.get("metric_label") ?? "",
    service: formData.get("service") ?? "none",
    link_url: formData.get("link_url") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    is_published: formData.get("is_published") ?? "",
  });
}

function revalidate() {
  revalidatePath("/admin/casos");
  revalidatePath("/");
}

export async function createSuccessCase(
  _prev: SuccessCaseFormState,
  formData: FormData
): Promise<SuccessCaseFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const imageFile = formData.get("image_file");
  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { fieldErrors: { image_file: ["Subí una imagen de fondo."] } };
  }

  const supabase = await createClient();
  let image_url: string;
  try {
    image_url = await uploadPublicImage(supabase, BUCKET, imageFile);
  } catch (e) {
    return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
  }

  let logo_url: string | null = null;
  const logoFile = formData.get("logo_file");
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      logo_url = await uploadPublicImage(supabase, BUCKET, logoFile, "logos");
    } catch (e) {
      return { error: `No se pudo subir el logo: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase
    .from("success_cases")
    .insert({ ...parsed.data, image_url, logo_url });
  if (error) return { error: error.message };

  revalidate();
  return {};
}

export async function updateSuccessCase(
  id: string,
  _prev: SuccessCaseFormState,
  formData: FormData
): Promise<SuccessCaseFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const updateData: Record<string, unknown> = { ...parsed.data };

  const imageFile = formData.get("image_file");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      updateData.image_url = await uploadPublicImage(supabase, BUCKET, imageFile);
    } catch (e) {
      return { error: `No se pudo subir la imagen: ${(e as Error).message}` };
    }
  }

  const logoFile = formData.get("logo_file");
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      updateData.logo_url = await uploadPublicImage(supabase, BUCKET, logoFile, "logos");
    } catch (e) {
      return { error: `No se pudo subir el logo: ${(e as Error).message}` };
    }
  }
  if (formData.get("remove_logo") === "on") updateData.logo_url = null;

  const { error } = await supabase.from("success_cases").update(updateData).eq("id", id);
  if (error) return { error: error.message };

  revalidate();
  return {};
}

// Nunca deja escapar una excepción: devuelve { error } para la UI.
export async function deleteSuccessCase(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("success_cases")
      .delete()
      .eq("id", id)
      .select("image_url")
      .maybeSingle();
    if (error) return { error: `No se pudo eliminar el caso: ${error.message}` };

    // Limpieza de la imagen en storage: best-effort, no bloqueante.
    const path = data?.image_url?.split(`/${BUCKET}/`).pop();
    if (path) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([path]);
      if (storageError) console.error("No se pudo borrar la imagen del caso:", storageError.message);
    }

    revalidate();
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido.";
    return { error: `No se pudo eliminar el caso: ${message}` };
  }
}
