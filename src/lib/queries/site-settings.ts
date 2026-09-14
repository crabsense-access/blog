import { createClient, createPublicClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single();

  if (error) throw error;
  return data;
}

// Usada en páginas públicas (ej. la página de categoría, para el tamaño
// inicial del listado de posts). Si falla por cualquier motivo (tabla
// todavía sin migrar, etc.), cae a los defaults de la tabla en vez de
// romper la página.
export async function getPublicSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const { message, code, details, hint } = error as {
      message?: string;
      code?: string;
      details?: string | null;
      hint?: string | null;
    };
    console.error("getPublicSiteSettings failed, falling back to defaults:", {
      message,
      code,
      details,
      hint,
    });
    return {
      id: true,
      category_page_initial_items: 10,
      gtm_id: null,
      updated_at: new Date().toISOString(),
    };
  }
}
