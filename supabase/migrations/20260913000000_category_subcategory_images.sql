-- Imagen de fondo configurable para categorías y subcategorías (el div
-- placeholder que hoy es un rectángulo gris en CategoryCard).
alter table public.categories add column if not exists image_url text;
alter table public.subcategories add column if not exists image_url text;

-- Bucket de storage para esas imágenes (mismo patrón que "avatars" y
-- "client-logos", ver supabase/schema.sql). Correlo una sola vez si tu
-- proyecto permite crear buckets por SQL; si no, creá el bucket
-- "category-images" (público) a mano desde Storage > New bucket.
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

drop policy if exists "public read category-images" on storage.objects;
create policy "public read category-images" on storage.objects
  for select using (bucket_id = 'category-images');

drop policy if exists "authenticated manage category-images" on storage.objects;
create policy "authenticated manage category-images" on storage.objects
  for all using (bucket_id = 'category-images' and auth.uid() is not null)
  with check (bucket_id = 'category-images' and auth.uid() is not null);
