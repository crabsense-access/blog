-- Formulario de contacto de la home (bloque "¿Listo para transformar tu
-- negocio?"): nombre, email, teléfono, sitio web y comentario. Se guarda en
-- la misma tabla leads que el prompt del hero, marcado con source = 'form',
-- para verlos todos juntos en /admin/leads.
-- En los leads del formulario, contact = email y contact_type = 'email', así
-- los avisos por email/WhatsApp existentes siguen funcionando igual.

alter table public.leads add column if not exists source text not null default 'prompt';
alter table public.leads add column if not exists name text;
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists phone text;

alter table public.leads drop constraint if exists leads_source_valid;
alter table public.leads
  add constraint leads_source_valid check (source in ('prompt', 'form'));

alter table public.leads drop constraint if exists leads_name_len;
alter table public.leads
  add constraint leads_name_len check (name is null or char_length(name) <= 120);

alter table public.leads drop constraint if exists leads_email_len;
alter table public.leads
  add constraint leads_email_len check (email is null or char_length(email) <= 160);

alter table public.leads drop constraint if exists leads_phone_len;
alter table public.leads
  add constraint leads_phone_len check (phone is null or char_length(phone) <= 40);
