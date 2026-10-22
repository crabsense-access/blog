"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function setPostSchedule(id: string, date: string | null, time: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("linkedin_posts")
    .update({
      scheduled_for: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      scheduled_time: time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : null,
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/linkedin/calendario");
  revalidatePath("/admin/linkedin");
  revalidatePath(`/admin/linkedin/${id}`);
}
