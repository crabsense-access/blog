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

// ---------------------------------------------------------------------------
// Problemas ("issues") de cada servicio — tabla service_issues
// ---------------------------------------------------------------------------

export interface ServiceIssueFormState {
  error?: string;
  ok?: boolean;
}

function parseIssue(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000);
  // bullets: uno por línea, sin vacíos
  const help = String(formData.get("help") ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((l) => l.slice(0, 300));
  const sortRaw = Number(formData.get("sort_order") ?? 0);
  const sort_order = Number.isFinite(sortRaw) ? Math.trunc(sortRaw) : 0;
  return { title, description, help, sort_order };
}

function revalidateIssues() {
  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function createServiceIssue(
  slug: string,
  _prevState: ServiceIssueFormState,
  formData: FormData
): Promise<ServiceIssueFormState> {
  if (!SERVICE_LIST.some((s) => s.slug === slug)) return { error: "Servicio inválido." };
  const issue = parseIssue(formData);
  if (!issue.title) return { error: "El título es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("service_issues")
    .insert({ ...issue, service_slug: slug });
  if (error) return { error: error.message };

  revalidateIssues();
  return { ok: true };
}

export async function updateServiceIssue(
  id: string,
  _prevState: ServiceIssueFormState,
  formData: FormData
): Promise<ServiceIssueFormState> {
  const issue = parseIssue(formData);
  if (!issue.title) return { error: "El título es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase.from("service_issues").update(issue).eq("id", id);
  if (error) return { error: error.message };

  revalidateIssues();
  return { ok: true };
}

// Nunca deja escapar una excepción: devuelve { error } para la UI.
export async function deleteServiceIssue(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("service_issues").delete().eq("id", id);
    if (error) return { error: `No se pudo eliminar el problema: ${error.message}` };
    revalidateIssues();
    return {};
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error desconocido.";
    return { error: `No se pudo eliminar el problema: ${message}` };
  }
}
