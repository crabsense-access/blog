-- Metadata SEO/LLM y FAQ estructurado por post. "updated_at" y su trigger
-- de auto-actualización ya existen desde el schema original — no hace
-- falta tocarlos, solo se usan en la UI para mostrar "Actualizado el".
alter table public.posts add column if not exists meta_title text;
alter table public.posts add column if not exists meta_description text;
alter table public.posts add column if not exists canonical_url text;
alter table public.posts add column if not exists faqs jsonb not null default '[]'::jsonb;
