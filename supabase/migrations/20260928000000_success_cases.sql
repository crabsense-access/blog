-- Casos de éxito de la home (sección debajo de "Nuestros servicios"),
-- editables desde /admin/casos. Cada caso es una card a todo el ancho con
-- una imagen de fondo oscurecida y el texto en blanco por delante.
create table if not exists public.success_cases (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  title text not null,
  description text,
  -- Resultado destacado, ej. "+180%" / "tráfico orgánico en 6 meses"
  metric_value text,
  metric_label text,
  -- Servicio asociado (analytics | seo | ads | ia), opcional: pinta la pill
  service text,
  image_url text,
  -- Link opcional (ej. a una nota del blog con el caso completo)
  link_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists success_cases_set_updated_at on public.success_cases;
create trigger success_cases_set_updated_at
  before update on public.success_cases
  for each row execute procedure public.set_updated_at();

alter table public.success_cases enable row level security;

drop policy if exists "public read published success_cases" on public.success_cases;
create policy "public read published success_cases" on public.success_cases
  for select using (is_published or auth.uid() is not null);

drop policy if exists "authenticated manage success_cases" on public.success_cases;
create policy "authenticated manage success_cases" on public.success_cases
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Bucket público para las imágenes de fondo (mismo patrón que "service-images").
insert into storage.buckets (id, name, public)
values ('success-cases', 'success-cases', true)
on conflict (id) do nothing;

drop policy if exists "public read success-cases" on storage.objects;
create policy "public read success-cases" on storage.objects
  for select using (bucket_id = 'success-cases');

drop policy if exists "authenticated manage success-cases" on storage.objects;
create policy "authenticated manage success-cases" on storage.objects
  for all using (bucket_id = 'success-cases' and auth.uid() is not null)
  with check (bucket_id = 'success-cases' and auth.uid() is not null);
