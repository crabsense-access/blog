"use server";

import { after } from "next/server";

import { notifyNewLead } from "@/lib/lead-notifications";
import { createPublicClient } from "@/lib/supabase/server";
import {
  contactFormSchema,
  detectContactType,
  leadSchema,
  type ContactFormField,
  type ContactFormInput,
  type LeadInput,
} from "@/lib/validations/lead";

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

export interface ContactFormResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<ContactFormField, string>>;
}

/** Formulario de contacto de la home: se guarda en leads con source = 'form'. */
export async function submitContactForm(
  input: ContactFormInput & { company?: string }
): Promise<ContactFormResult> {
  // honeypot: los bots completan este campo oculto, las personas no
  if (input.company) return { ok: true };

  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: ContactFormResult["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as ContactFormField;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisá los datos marcados.", fieldErrors };
  }
  const { name, email, phone, website_url, message, page_path } = parsed.data;

  const supabase = createPublicClient();
  const { error } = await supabase.from("leads").insert({
    source: "form",
    name,
    email,
    phone,
    website_url,
    message,
    contact: email,
    contact_type: "email",
    page_path: page_path ?? null,
  });

  if (error) {
    console.error("submitContactForm", error);
    return { ok: false, error: "No pudimos enviar tu consulta. Probá de nuevo en un momento." };
  }

  after(() =>
    notifyNewLead({
      services: [],
      message,
      contact: email,
      contactType: "email",
      websiteUrl: website_url,
      pagePath: page_path,
      name,
      phone,
      source: "form",
    })
  );

  return { ok: true };
}
