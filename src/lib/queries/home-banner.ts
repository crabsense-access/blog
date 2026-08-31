import { createClient } from "@/lib/supabase/server";
import type { HomeBanner } from "@/lib/types";

export async function getHomeBanner(): Promise<HomeBanner> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_banner")
    .select("*")
    .eq("id", true)
    .single();

  if (error) throw error;
  return data;
}
