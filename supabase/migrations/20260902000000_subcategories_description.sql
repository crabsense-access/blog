-- Agrega el campo description a las subcategorías, usado en la tarjeta de
-- categoría/subcategoría de /blog/categoria/[slug]/[subcategorySlug].

alter table public.subcategories add column if not exists description text;
