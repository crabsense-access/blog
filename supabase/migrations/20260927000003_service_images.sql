-- Imagen de cada servicio del bloque "Nuestros servicios" de la home,
-- editable desde /admin/services. El resto del contenido del servicio vive
-- en el código (src/lib/services.ts); acá solo la imagen y su texto alt.
create table if not exists public.service_images (
  slug text primary key,
  image_url text,
  image_alt text,
  updated_at timestamptz not null default now()
);

insert into public.service_images (slug) values
  ('analytics'), ('seo'), ('ads'), ('ia')
on conflict (slug) do nothing;

drop trigger if exists service_images_set_updated_at on public.service_images;
create trigger service_images_set_updated_at
  before update on public.service_images
  for each row execute procedure public.set_updated_at();

alter table public.service_images enable row level security;

drop policy if exists "public read service_images" on public.service_images;
create policy "public read service_images" on public.service_images
  for select using (true);

drop policy if exists "authenticated manage service_images" on public.service_images;
create policy "authenticated manage service_images" on public.service_images
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Bucket público para las imágenes (mismo patrón que "client-logos").
insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

drop policy if exists "public read service-images" on storage.objects;
create policy "public read service-images" on storage.objects
  for select using (bucket_id = 'service-images');

drop policy if exists "authenticated manage service-images" on storage.objects;
create policy "authenticated manage service-images" on storage.objects
  for all using (bucket_id = 'service-images' and auth.uid() is not null)
  with check (bucket_id = 'service-images' and auth.uid() is not null);
