-- Agrega el campo featured_in_slider a posts, usado para marcar qué notas
-- aparecen en el slider principal del home del blog (estilo blog.google).
-- El admin puede marcar más de una; el frontend limita a las 3 más
-- recientes, ordenadas por fecha de publicación descendente.

alter table public.posts add column if not exists featured_in_slider boolean not null default false;

create index if not exists posts_featured_in_slider_idx
  on public.posts (featured_in_slider, published_at desc);
