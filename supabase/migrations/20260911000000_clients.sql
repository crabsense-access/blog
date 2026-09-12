-- Clientes: logos que alimentan el carrusel de la home del blog, repartidos
-- en 3 filas (row_number 1|2|3).
--
-- Nombrada "client_logos" (no "clients") a propósito: en algunos proyectos
-- ya existe una tabla "clients" con otro propósito (ej. CRM/contactos), y
-- si esta migración se corriera contra uno de esos, "create table if not
-- exists public.clients" no crearía nada nuevo (haría no-op sobre la tabla
-- existente) y los pasos siguientes fallarían con "column ... does not
-- exist". Un nombre específico evita cualquier colisión.
create table if not exists public.client_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  row_number int not null default 1 check (row_number in (1, 2, 3)),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists client_logos_row_number_idx on public.client_logos (row_number, sort_order);

alter table public.client_logos enable row level security;

drop policy if exists "public read client_logos" on public.client_logos;
create policy "public read client_logos" on public.client_logos
  for select using (true);

drop policy if exists "authenticated manage client_logos" on public.client_logos;
create policy "authenticated manage client_logos" on public.client_logos
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Bucket de storage para los logos de clientes (mismo patrón que "avatars",
-- ver supabase/schema.sql). Correlo una sola vez si tu proyecto permite
-- crear buckets por SQL; si no, creá el bucket "client-logos" (público) a
-- mano desde Storage > New bucket en el dashboard.
insert into storage.buckets (id, name, public)
values ('client-logos', 'client-logos', true)
on conflict (id) do nothing;

drop policy if exists "public read client-logos" on storage.objects;
create policy "public read client-logos" on storage.objects
  for select using (bucket_id = 'client-logos');

drop policy if exists "authenticated manage client-logos" on storage.objects;
create policy "authenticated manage client-logos" on storage.objects
  for all using (bucket_id = 'client-logos' and auth.uid() is not null)
  with check (bucket_id = 'client-logos' and auth.uid() is not null);
