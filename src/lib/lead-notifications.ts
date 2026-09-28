// Avisos internos cuando entra un lead nuevo: email (SMTP de Google Workspace)
// y WhatsApp (CallMeBot). Solo se usa desde el servidor.
//
// Variables de entorno (ver .env.local.example):
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO, LEAD_EMAIL_FROM
//   LEAD_WHATSAPP_RECIPIENTS = "+5491100000000:APIKEY,+5491111111111:APIKEY2"
// Si faltan las variables de un canal, ese canal se saltea sin romper nada.

import nodemailer from "nodemailer";

import { LEAD_SERVICE_OPTIONS, type LeadService } from "@/lib/validations/lead";

export interface LeadNotification {
  services: LeadService[];
  message: string;
  contact: string;
  contactType: "email" | "phone";
  websiteUrl?: string | null;
  pagePath?: string | null;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const serviceLabels = (services: LeadService[]) =>
  services.length
    ? services.map((s) => LEAD_SERVICE_OPTIONS.find((o) => o.value === s)?.label ?? s).join(", ")
    : "Sin especificar";

const nowAR = () =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

/** Link directo para responder: mailto o WhatsApp al número del lead */
function replyLink(lead: LeadNotification) {
  if (lead.contactType === "email") return `mailto:${lead.contact}`;
  const digits = lead.contact.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

async function sendEmail(lead: LeadNotification) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_EMAIL_TO, LEAD_EMAIL_FROM } = process.env;
  if (!SMTP_USER || !SMTP_PASS || !LEAD_EMAIL_TO) {
    console.warn("[leads] email omitido: faltan SMTP_USER / SMTP_PASS / LEAD_EMAIL_TO");
    return;
  }
  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    // las contraseñas de aplicación de Google se muestran en grupos de 4
    // con espacios: se quitan por si se pegaron así
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s/g, "") },
  });

  const services = serviceLabels(lead.services);
  const link = replyLink(lead);
  const msg = lead.message || "(sin mensaje)";

  await transport.sendMail({
    from: LEAD_EMAIL_FROM || `Crabsense Web <${SMTP_USER}>`,
    to: LEAD_EMAIL_TO.split(",").map((s) => s.trim()).filter(Boolean),
    replyTo: lead.contactType === "email" ? lead.contact : undefined,
    subject: `Nuevo lead (${services}) · ${lead.contact}`,
    text: [
      "Nuevo lead desde el sitio — contactar en menos de 10 minutos.",
      "",
      `Servicios: ${services}`,
      `Contacto: ${lead.contact} (${lead.contactType === "email" ? "email" : "celular"})`,
      `Sitio web: ${lead.websiteUrl ?? "-"}`,
      `Responder: ${link}`,
      "",
      "Mensaje:",
      msg,
      "",
      `Página: ${lead.pagePath ?? "-"} · ${nowAR()}`,
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#0a0a0a">
        <p style="margin:0 0 4px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#3d3c89">Nuevo lead · ${escapeHtml(nowAR())}</p>
        <h2 style="margin:0 0 16px;font-size:20px">Contactar en menos de 10 minutos</h2>
        <table style="border-collapse:collapse;font-size:14px;width:100%">
          <tr><td style="padding:6px 12px 6px 0;color:#666;width:110px">Servicios</td><td style="padding:6px 0"><strong>${escapeHtml(services)}</strong></td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666">Contacto</td><td style="padding:6px 0"><strong>${escapeHtml(lead.contact)}</strong></td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666">Sitio web</td><td style="padding:6px 0">${lead.websiteUrl ? `<a href="${escapeHtml(lead.websiteUrl)}" style="color:#3d3c89">${escapeHtml(lead.websiteUrl)}</a>` : "-"}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">Mensaje</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(msg)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#666">Página</td><td style="padding:6px 0">${escapeHtml(lead.pagePath ?? "-")}</td></tr>
        </table>
        <p style="margin:20px 0 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px">${lead.contactType === "email" ? "Responder por email" : "Escribir por WhatsApp"}</a></p>
      </div>`,
  });
}

async function sendWhatsApp(lead: LeadNotification) {
  const recipients = (process.env.LEAD_WHATSAPP_RECIPIENTS || "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      const i = r.lastIndexOf(":");
      return { phone: r.slice(0, i).trim(), apikey: r.slice(i + 1).trim() };
    })
    .filter((r) => r.phone && r.apikey);
  if (!recipients.length) {
    console.warn("[leads] WhatsApp omitido: falta LEAD_WHATSAPP_RECIPIENTS");
    return;
  }

  const msg = lead.message ? lead.message.slice(0, 500) : "(sin mensaje)";
  const text = [
    "*Nuevo lead Crabsense* — contactar en < 10 min",
    `Servicios: ${serviceLabels(lead.services)}`,
    `Contacto: ${lead.contact}`,
    `Sitio web: ${lead.websiteUrl ?? "-"}`,
    `Responder: ${replyLink(lead)}`,
    `Mensaje: ${msg}`,
  ].join("\n");

  // CallMeBot: 1 request por destinatario (cada número tiene su propia apikey)
  const results = await Promise.allSettled(
    recipients.map(async ({ phone, apikey }) => {
      const url =
        "https://api.callmebot.com/whatsapp.php?" +
        new URLSearchParams({ phone, text, apikey }).toString();
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`CallMeBot ${res.status} para ${phone}`);
    })
  );
  results.forEach((r) => {
    if (r.status === "rejected") console.error("[leads] WhatsApp:", r.reason);
  });
}

/** Envía email y WhatsApp en paralelo. Nunca lanza: los errores quedan en el log. */
export async function notifyNewLead(lead: LeadNotification) {
  const results = await Promise.allSettled([sendEmail(lead), sendWhatsApp(lead)]);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[leads] ${i === 0 ? "email" : "whatsapp"}:`, r.reason);
  });
}
