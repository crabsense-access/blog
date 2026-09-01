-- Migración: árbol de categorías a 2 niveles (GA4 / SEO / ADS / IA).
-- FASE 1 — aditiva y segura, no borra nada. Ejecutar primero.
--
-- Qué hace:
--   1) Renombra "Ads" -> "ADS" e "Inteligencia Artificial" -> "IA" (mismo id).
--   2) Crea la categoría principal nueva "GA4".
--   3) Crea subcategorías reales (tabla `subcategories`) para las categorías
--      viejas que se van a convertir: Analytics, Google Search Console
--      (-> GA4); SEO General, SEO Local, SEO Técnico, Ecommerce SEO,
--      Keyword Research, Contenido (-> SEO); IA + SEO, GEO (-> IA).
--   4) Migra los artículos que tenían alguna de esas categorías viejas
--      asignada: les agrega la subcategoría nueva en post_subcategories y la
--      categoría principal nueva en post_categories.
--
-- No borra las categorías viejas todavía — eso es la Fase 2, y solo debe
-- correrse después de confirmar que esta fase migró bien los datos (ver
-- las queries de verificación al final de este archivo).

begin;

-- 1) Renombrar categorías principales existentes (mismo id, no rompe FKs).
update public.categories set name = 'ADS' where slug = 'ads';
update public.categories set name = 'IA' where slug = 'inteligencia-artificial';
-- "SEO" queda igual, ya es principal.

-- 2) Categoría principal nueva.
insert into public.categories (name, slug)
values ('GA4', 'ga4')
on conflict (slug) do nothing;

-- 2b) El bloque 1 de la home (category_blocks) apuntaba a "Analytics", que se
-- borra en la Fase 2. Lo reasignamos a GA4 (su sucesora) para que el
-- carrusel no quede vacío cuando se borre Analytics.
update public.category_blocks
set category_id = (select id from public.categories where slug = 'ga4')
where position = 1;

-- 3) Subcategorías de GA4.
insert into public.subcategories (name, slug, category_id)
select c.name, c.slug, (select id from public.categories where slug = 'ga4')
from public.categories c
where c.slug in ('analytics', 'google-search-console')
on conflict (category_id, slug) do nothing;

-- Subcategorías de SEO.
insert into public.subcategories (name, slug, category_id)
select c.name, c.slug, (select id from public.categories where slug = 'seo')
from public.categories c
where c.slug in (
  'seo-general', 'seo-local', 'seo-tecnico',
  'ecommerce-seo', 'keyword-research', 'contenido'
)
on conflict (category_id, slug) do nothing;

-- Subcategorías de IA.
insert into public.subcategories (name, slug, category_id)
select c.name, c.slug, (select id from public.categories where slug = 'inteligencia-artificial')
from public.categories c
where c.slug in ('ia-seo', 'geo')
on conflict (category_id, slug) do nothing;

-- 4) Migrar los artículos afectados. Genérico: recorre el mapeo
--    categoría-vieja -> categoría-principal-nueva, no hardcodea posts.
do $$
declare
  mapping record;
begin
  for mapping in
    select * from (values
      ('analytics', 'ga4'),
      ('google-search-console', 'ga4'),
      ('seo-general', 'seo'),
      ('seo-local', 'seo'),
      ('seo-tecnico', 'seo'),
      ('ecommerce-seo', 'seo'),
      ('keyword-research', 'seo'),
      ('contenido', 'seo'),
      ('ia-seo', 'inteligencia-artificial'),
      ('geo', 'inteligencia-artificial')
    ) as m(old_slug, new_main_slug)
  loop
    -- Cada post que tenía la categoría vieja pasa a tener la subcategoría
    -- correspondiente en post_subcategories...
    insert into public.post_subcategories (post_id, subcategory_id)
    select pc.post_id, s.id
    from public.post_categories pc
    join public.categories old_c on old_c.slug = mapping.old_slug
    join public.subcategories s
      on s.slug = mapping.old_slug
     and s.category_id = (select id from public.categories where slug = mapping.new_main_slug)
    where pc.category_id = old_c.id
    on conflict (post_id, subcategory_id) do nothing;

    -- ...y queda también con la categoría principal nueva en post_categories.
    insert into public.post_categories (post_id, category_id)
    select pc.post_id, (select id from public.categories where slug = mapping.new_main_slug)
    from public.post_categories pc
    join public.categories old_c on old_c.slug = mapping.old_slug
    where pc.category_id = old_c.id
    on conflict (post_id, category_id) do nothing;
  end loop;
end $$;

commit;

-- ============ Verificación (correr después, a mano) ============
-- Cuántas subcategorías quedaron creadas por principal (debería dar
-- GA4: 2, SEO: 6, IA: 2):
--   select cat.name, count(*) from public.subcategories sc
--   join public.categories cat on cat.id = sc.category_id
--   group by cat.name;
--
-- Los 5 posts que tenían "Analytics" deberían aparecer acá con GA4 +
-- subcategoría Analytics:
--   select p.title, cat.name as categoria, sub.name as subcategoria
--   from public.posts p
--   join public.post_categories pc on pc.post_id = p.id
--   join public.categories cat on cat.id = pc.category_id
--   left join public.post_subcategories psub on psub.post_id = p.id
--   left join public.subcategories sub on sub.id = psub.subcategory_id
--   where cat.slug = 'ga4';
