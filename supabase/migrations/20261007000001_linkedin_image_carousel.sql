-- Nuevo formato de post de LinkedIn: carrusel de imágenes (varias imágenes
-- PNG de 1080×1350 en un mismo post), además del carrusel en PDF (documento).
alter table public.linkedin_posts drop constraint if exists linkedin_posts_format_check;
alter table public.linkedin_posts
  add constraint linkedin_posts_format_check
  check (format in ('carousel', 'image_carousel', 'image', 'text'));
