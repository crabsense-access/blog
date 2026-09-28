import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { ServiceImage } from "@/lib/services";

// Admin: todas las filas (con sesión).
export async function getServiceImages(): Promise<ServiceImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_images")
    .select("slug, image_url, image_alt");
  if (error) throw error;
  return data ?? [];
}

// Home pública: mapa slug -> imagen. Si la tabla todavía no existe (falta
// correr la migración) o la query falla, devuelve {} y el bloque se muestra
// sin imagen en vez de romper la página.
export async function getPublicServiceImages(): Promise<Record<string, ServiceImage>> {
  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("service_images")
      .select("slug, image_url, image_alt");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((row: ServiceImage) => [row.slug, row]));
  } catch (error) {
    console.warn("getPublicServiceImages failed (¿falta correr la migración service_images?):", (error as { message?: string }).message);
    return {};
  }
}
