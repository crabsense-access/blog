"use server";

import { after } from "next/server";

import { notifyNewLead } from "@/lib/lead-notifications";
import { createPublicClient } from "@/lib/supabase/server";
import { detectContactType, leadSchema, type LeadInput } from "@/lib/validations/lead";

export interface LeadResult {
  ok: boolean;
  error?: string;
}

export async function submitLead(input: LeadInput & { website?: string }): Promise<LeadResult> {
  // honeypot: los bots completan este campo oculto, las personas no
  if (input.website) return { ok: true };

  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }
  const { services, message, contact, website_url, page_path } = parsed.data;
  if (!message && services.length === 0) {
    return { ok: false, error: "Contanos un poco sobre tu proyecto." };
  }

  const contactType = detectContactType(contact)!;
  const supabase = createPublicClient();
  const { error } = await supabase.from("leads").insert({
    services,
    message,
    contact,
    contact_type: contactType,
    website_url,
    page_path: page_path ?? null,
  });

  if (error) {
    console.error("submitLead", error);
    return { ok: false, error: "No pudimos enviar tu consulta. Probá de nuevo en un momento." };
  }

  // avisos al equipo (email + WhatsApp) después de responder, sin demorar al usuario
  after(() =>
    notifyNewLead({ services, message, contact, contactType, websiteUrl: website_url, pagePath: page_path })
  );

  return { ok: true };
}
