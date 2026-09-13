-- Bucket de storage para las imágenes de portada de los posts (mismo
-- patrón que "avatars"/"client-logos"/"category-images", ver
-- supabase/schema.sql).
insert into storage.buckets (id, name, public)
values ('post-covers', 'post-covers', true)
on conflict (id) do nothing;

drop policy if exists "public read post-covers" on storage.objects;
create policy "public read post-covers" on storage.objects
  for select using (bucket_id = 'post-covers');

drop policy if exists "authenticated manage post-covers" on storage.objects;
create policy "authenticated manage post-covers" on storage.objects
  for all using (bucket_id = 'post-covers' and auth.uid() is not null)
  with check (bucket_id = 'post-covers' and auth.uid() is not null);

-- El bucket "avatars" (fotos de autor) ya existe en el proyecto pero nunca
-- tuvo una migración real propia (solo estaba documentado como paso manual
-- en schema.sql) — la codificamos acá para que quede en el historial y
-- las policies de lectura/escritura sean explícitas.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "public read avatars" on storage.objects;
create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "authenticated manage avatars" on storage.objects;
create policy "authenticated manage avatars" on storage.objects
  for all using (bucket_id = 'avatars' and auth.uid() is not null)
  with check (bucket_id = 'avatars' and auth.uid() is not null);
