-- Reversión: cada post vuelve a tener una única "categoría principal"
-- (posts.category_id), en vez de varias vía post_categories. Las
-- subcategorías (subcategories/post_subcategories) no cambian, siguen
-- siendo muchas por post.
--
-- posts.category_id ya existe en la tabla (se dejó "por compatibilidad" en
-- la migración a muchas-a-muchas y nunca se borró) pero está desactualizada
-- desde entonces. Esta migración la recalcula desde post_categories.
--
-- Resolución para posts con más de una categoría: confirmado con el usuario
-- que los únicos casos hoy son 5 posts con "Analytics" (vieja, en camino a
-- borrarse) + "GA4" (su sucesora) — se resuelven a GA4. El resto de los
-- posts ya tiene una sola categoría, sin ambigüedad.

begin;

-- Caso general: posts con una sola fila en post_categories.
update public.posts p
set category_id = pc.category_id
from public.post_categories pc
where pc.post_id = p.id
and (
  select count(*) from public.post_categories pc2 where pc2.post_id = p.id
) = 1;

-- Caso especial confirmado: posts con "Analytics" + "GA4" a la vez -> GA4.
update public.posts p
set category_id = (select id from public.categories where slug = 'ga4')
where p.id in (
  select pc.post_id
  from public.post_categories pc
  join public.categories c on c.id = pc.category_id
  where c.slug = 'analytics'
)
and p.id in (
  select pc.post_id
  from public.post_categories pc
  join public.categories c on c.id = pc.category_id
  where c.slug = 'ga4'
);

commit;

-- ============ Verificación (correr después, a mano) ============
-- Todos los posts deberían tener category_id no nulo (salvo que alguno no
-- tuviera ninguna fila en post_categories):
--   select id, title, category_id from public.posts where category_id is null;
--
-- Categoría final por post, para revisar contra la lista que se mostró
-- antes de aplicar esta migración:
--   select p.title, cat.name as categoria_principal
--   from public.posts p
--   left join public.categories cat on cat.id = p.category_id
--   order by p.title;
--
-- Ningún post debería tener una subcategoría que no pertenezca a su
-- categoría principal (debería devolver 0 filas):
--   select p.id, p.title, sub.name as subcategoria, cat.name as categoria
--   from public.posts p
--   join public.post_subcategories psub on psub.post_id = p.id
--   join public.subcategories sub on sub.id = psub.subcategory_id
--   left join public.categories cat on cat.id = p.category_id
--   where sub.category_id is distinct from p.category_id;
