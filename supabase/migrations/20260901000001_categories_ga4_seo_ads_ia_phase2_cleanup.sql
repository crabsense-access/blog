-- Migración: árbol de categorías a 2 niveles (GA4 / SEO / ADS / IA).
-- FASE 2 — DESTRUCTIVA. Borra las categorías viejas ya migradas a
-- subcategorías en la Fase 1 (20260901000000_..._phase1.sql).
--
-- NO CORRER esto hasta:
--   1) Haber ejecutado la Fase 1.
--   2) Haber verificado con las queries del final de la Fase 1 que los
--      artículos quedaron bien migrados (categoría principal nueva +
--      subcategoría correspondiente).
--   3) Haber decidido qué pasa con category_blocks posición 1, que hoy
--      apunta a "Analytics" — esa categoría se borra acá, y por el
--      "on delete set null" de category_blocks.category_id, la posición 1
--      queda en null (el carrusel desaparece de la home) si no se reasigna
--      antes o después de correr esto.
--
-- El "on delete cascade" de post_categories -> categories limpia las filas
-- viejas de post_categories asociadas a estas 10 categorías; no hace falta
-- tocarlas a mano porque la Fase 1 ya dejó a esos posts con la categoría
-- principal nueva.

begin;

delete from public.categories
where slug in (
  'analytics', 'google-search-console',
  'seo-general', 'seo-local', 'seo-tecnico',
  'ecommerce-seo', 'keyword-research', 'contenido',
  'ia-seo', 'geo'
);

commit;
