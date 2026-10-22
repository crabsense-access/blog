import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";

/** Leads del sitio (prompt del hero + formulario de contacto), más nuevos primero. */
export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  // los leads anteriores a la migración del formulario no tienen source
  return (data ?? []).map((l: Lead) => ({ ...l, source: l.source ?? "prompt" }));
}
