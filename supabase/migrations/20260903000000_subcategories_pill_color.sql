-- Agrega el campo pill_color a las subcategorías, usado para el color de
-- fondo dinámico de la pill de subcategoría en el bloque de categoría/
-- subcategoría (mismo mecanismo que categories.pill_color).

alter table public.subcategories add column if not exists pill_color text;
