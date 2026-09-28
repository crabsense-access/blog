-- Sitio web del lead (se pide junto con el email/celular en el bloque
-- "¿Qué proyecto tenés en mente hoy?"). Se guarda normalizado con https://.
-- Nullable para no romper los leads que ya existen.
alter table public.leads add column if not exists website_url text;

alter table public.leads drop constraint if exists leads_website_url_len;
alter table public.leads
  add constraint leads_website_url_len check (website_url is null or char_length(website_url) <= 300);
