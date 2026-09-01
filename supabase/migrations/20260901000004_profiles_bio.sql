-- Agrega el campo bio (descripción) al perfil de autores, usado en la
-- tarjeta de autor de /blog/autor/[id].

alter table public.profiles add column if not exists bio text;
