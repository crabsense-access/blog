-- Posts de LinkedIn generados desde /admin/linkedin. Cada fila es un borrador
-- (texto del post + slides del carrusel en jsonb) que se revisa en el admin,
-- se exporta a PDF y se publica a mano en LinkedIn.
-- type / format / status son check constraints (no enums) para poder sumar
-- valores con un ALTER, mismo criterio que glossary_terms.
create table if not exists public.linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'article', 'product_update', 'stat', 'success_case',
    'before_after', 'opinion', 'checklist'
  )),
  title text not null,
  format text not null default 'carousel' check (format in ('carousel', 'image', 'text')),
  -- Fuentes (todas opcionales; cada tipo usa las suyas)
  source_post_id uuid references public.posts (id) on delete set null,
  source_case_id uuid references public.success_cases (id) on delete set null,
  source_url text,
  platform text,
  source_notes text,
  -- Contenido
  caption text not null default '',
  first_comment text not null default '',
  hashtags text[] not null default '{}',
  slides jsonb not null default '[]'::jsonb,
  style text not null default 'light' check (style in ('light', 'dark')),
  -- Quién lo publica: null = página de Crabsense; si no, un perfil (socio)
  publish_as_profile_id uuid references public.profiles (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published')),
  scheduled_for date,
  published_at timestamptz,
  linkedin_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists linkedin_posts_status_updated_idx
  on public.linkedin_posts (status, updated_at desc);

drop trigger if exists linkedin_posts_set_updated_at on public.linkedin_posts;
create trigger linkedin_posts_set_updated_at
  before update on public.linkedin_posts
  for each row execute procedure public.set_updated_at();

-- Solo uso interno: nada de lectura pública.
alter table public.linkedin_posts enable row level security;

drop policy if exists "authenticated manage linkedin_posts" on public.linkedin_posts;
create policy "authenticated manage linkedin_posts" on public.linkedin_posts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
