-- Textos del hero de la home, editables desde /admin/settings:
-- la pill de arriba y el titular grande. Nullable: si quedan vacíos,
-- ese elemento no se muestra.
alter table public.site_settings
  add column if not exists hero_pill_text text default 'Agencia de marketing digital con IA',
  add column if not exists hero_title text default 'Esto es una prueba desde el admin';

update public.site_settings
set
  hero_pill_text = coalesce(hero_pill_text, 'Agencia de marketing digital con IA'),
  hero_title = coalesce(hero_title, 'Esto es una prueba desde el admin')
where id;
