-- Reversión a categoría única: post_categories deja de usarse por completo
-- (posts.category_id vuelve a ser la fuente de verdad). Este archivo la
-- elimina.
--
-- NO CORRER esto hasta haber ejecutado y verificado
-- 20260901000002_posts_single_category_id.sql — confirmá que
-- posts.category_id quedó bien migrado antes de borrar la tabla que
-- contenía esos datos.

begin;

drop table if exists public.post_categories cascade;

commit;
