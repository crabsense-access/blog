import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { SuccessCase } from "@/lib/success-cases";

// Admin: todos los casos (publicados y ocultos).
export async function getSuccessCases(): Promise<SuccessCase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("success_cases")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as SuccessCase[];
}

// Home pública: solo los publicados. Si la tabla todavía no existe (falta
// correr la migración) o la query falla, devuelve [] y la sección no se
// muestra, sin romper la página.
export async function getPublicSuccessCases(): Promise<SuccessCase[]> {
  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("success_cases")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as SuccessCase[];
  } catch (error) {
    console.warn(
      "getPublicSuccessCases failed (¿falta correr la migración success_cases?):",
      (error as { message?: string }).message
    );
    return [];
  }
}
