"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { clientFormSchema } from "@/lib/validations/post";
import { uploadPublicImage } from "@/lib/storage";

export interface ClientFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parse(formData: FormData) {
  return clientFormSchema.safeParse({
    name: formData.get("name"),
    row_number: formData.get("row_number"),
  });
}

export async function createClientLogo(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const logoFile = formData.get("logo_file");
  if (!(logoFile instanceof File) || logoFile.size === 0) {
    return { fieldErrors: { logo_file: ["Subí un logo."] } };
  }

  const supabase = await createClient();

  let logo_url: string;
  try {
    logo_url = await uploadPublicImage(supabase, "client-logos", logoFile);
  } catch (e) {
    return { error: `No se pudo subir el logo: ${(e as Error).message}` };
  }

  const { error } = await supabase
    .from("client_logos")
    .insert({ ...parsed.data, logo_url });

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  revalidatePath("/blog");
  return {};
}

export async function updateClientLogo(
  id: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const updateData: Record<string, unknown> = { ...parsed.data };

  const logoFile = formData.get("logo_file");
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      updateData.logo_url = await uploadPublicImage(supabase, "client-logos", logoFile);
    } catch (e) {
      return { error: `No se pudo subir el logo: ${(e as Error).message}` };
    }
  }

  const { error } = await supabase.from("client_logos").update(updateData).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/clients");
  revalidatePath("/blog");
  return {};
}

export interface DeleteClientState {
  error?: string;
}

function logSupabaseError(context: string, error: unknown) {
  const { message, code, details, hint } = error as {
    message?: string;
    code?: string;
    details?: string | null;
    hint?: string | null;
  };
  console.error(context, { message, code, details, hint });
}

// Nunca deja escapar una excepción: si algo falla (incluido un timeout de
// red transitorio contra Supabase), devuelve { error } para que la UI
// muestre un mensaje en vez de romper la página con un Runtime Error.
export async function deleteClientLogo(id: string): Promise<DeleteClientState> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("client_logos")
      .delete()
      .eq("id", id)
      .select("logo_url")
      .maybeSingle();

    if (error) {
      logSupabaseError("deleteClientLogo failed:", error);
      return { error: `No se pudo eliminar el cliente: ${error.message}` };
    }

    // Limpieza del logo en storage: best-effort, no bloqueante — si falla
    // (bucket distinto, path inesperado, etc.) el cliente ya se borró de la
    // base igual, solo queda un archivo huérfano en el bucket.
    const path = data?.logo_url?.split("/client-logos/").pop();
    if (path) {
      const { error: storageError } = await supabase.storage
        .from("client-logos")
        .remove([path]);
      if (storageError) {
        logSupabaseError("No se pudo borrar el logo del storage (no bloqueante):", storageError);
      }
    }

    revalidatePath("/admin/clients");
    revalidatePath("/blog");
    return {};
  } catch (e) {
    logSupabaseError("deleteClientLogo threw:", e);
    const message = e instanceof Error ? e.message : "Error desconocido.";
    return { error: `No se pudo eliminar el cliente: ${message}` };
  }
}
