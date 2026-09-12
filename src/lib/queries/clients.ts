import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/types";

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_logos")
    .select("*")
    .order("row_number", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Usada en la home pública para alimentar el carrusel de logos: si la
// tabla todavía no existe (falta correr la migración) o la query falla por
// cualquier otro motivo, no debe tumbar el resto de la página — el
// carrusel simplemente cae a los logos placeholder.
export async function getPublicClients(): Promise<Client[]> {
  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("client_logos")
      .select("*")
      .order("row_number", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (error) {
    const { message, code, details, hint } = error as {
      message?: string;
      code?: string;
      details?: string | null;
      hint?: string | null;
    };
    console.error("getPublicClients failed, falling back to placeholders:", {
      message,
      code,
      details,
      hint,
    });
    return [];
  }
}
