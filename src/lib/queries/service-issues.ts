import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { ServiceIssue, ServiceIssueRow } from "@/lib/services";

const COLUMNS = "id, service_slug, sort_order, title, description, help";

// Admin: todas las filas (con sesión), ordenadas.
export async function getServiceIssues(): Promise<ServiceIssueRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_issues")
    .select(COLUMNS)
    .order("service_slug")
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as ServiceIssueRow[];
}

// Home pública: mapa slug -> issues ordenados. Si la tabla todavía no existe
// (falta correr la migración) o la query falla, devuelve {} y la home usa el
// contenido fijo del código.
export async function getPublicServiceIssues(): Promise<Record<string, ServiceIssue[]>> {
  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("service_issues")
      .select(COLUMNS)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    const map: Record<string, ServiceIssue[]> = {};
    for (const row of (data ?? []) as ServiceIssueRow[]) {
      (map[row.service_slug] ??= []).push({
        title: row.title,
        description: row.description,
        help: row.help ?? [],
      });
    }
    return map;
  } catch (error) {
    console.warn(
      "getPublicServiceIssues failed (¿falta correr la migración service_issues?):",
      (error as { message?: string }).message
    );
    return {};
  }
}
