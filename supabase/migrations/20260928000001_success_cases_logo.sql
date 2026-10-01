-- Logo del cliente en cada caso de éxito (opcional, editable desde /admin/casos).
-- Se guarda en el mismo bucket "success-cases".
alter table public.success_cases add column if not exists logo_url text;
