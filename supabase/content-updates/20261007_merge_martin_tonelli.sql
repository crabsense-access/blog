-- Unifica los dos perfiles "Martin Tonelli":
--   se queda:  tonellimartin@gmail.com
--   se borra:  martin.tonelli@crabsense.com
-- Todo lo que apuntaba al perfil que se borra (notas, glosario, posts de
-- LinkedIn) pasa al que queda. Correr entero en el SQL Editor de Supabase.

begin;

do $$
declare
  keep_id uuid;
  drop_id uuid;
begin
  select id into keep_id from public.profiles where lower(email) = 'tonellimartin@gmail.com';
  select id into drop_id from public.profiles where lower(email) = 'martin.tonelli@crabsense.com';

  if keep_id is null or drop_id is null then
    raise exception 'No se encontró alguno de los dos perfiles (keep=%, drop=%)', keep_id, drop_id;
  end if;

  -- reasignar todo al perfil que queda
  update public.posts          set author_id = keep_id             where author_id = drop_id;
  update public.glossary_terms set author_id = keep_id             where author_id = drop_id;
  update public.linkedin_posts set publish_as_profile_id = keep_id where publish_as_profile_id = drop_id;
  update public.linkedin_posts set created_by = keep_id            where created_by = drop_id;

  -- completar datos vacíos del que queda con los del que se borra
  update public.profiles k
     set public_title       = coalesce(k.public_title, d.public_title),
         bio                = coalesce(k.bio, d.bio),
         avatar_url         = coalesce(k.avatar_url, d.avatar_url),
         linkedin_url       = coalesce(k.linkedin_url, d.linkedin_url),
         is_featured_expert = k.is_featured_expert or d.is_featured_expert,
         featured_position  = coalesce(k.featured_position, d.featured_position)
    from public.profiles d
   where k.id = keep_id and d.id = drop_id;

  -- borrar el perfil y su usuario de login (si no, se volvería a crear al
  -- entrar con esa cuenta)
  delete from public.profiles where id = drop_id;
  delete from auth.users where id = drop_id or lower(email) = 'martin.tonelli@crabsense.com';

  raise notice 'Listo: perfil % unificado en %', drop_id, keep_id;
end $$;

commit;
