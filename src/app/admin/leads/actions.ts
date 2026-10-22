"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["nuevo", "contactado", "descartado"];

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<{ error?: string }> {
  if (!STATUSES.includes(status)) return { error: "Estado inválido." };
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  return {};
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  return {};
}
