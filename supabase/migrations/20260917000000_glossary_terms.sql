-- Glosario: términos con contenido generado (y editable) desde el admin.
-- category es un check constraint en vez de un enum de Postgres para poder
-- agregar categorías después con un simple ALTER (mismo criterio que status
-- en posts) en vez de tener que tocar el tipo.
create table if not exists public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  slug text not null,
  category text not null check (category in ('ga4', 'ads', 'ia', 'seo')),
  quick_answer text,
  has_formula boolean not null default false,
  formula jsonb,
  extended_explanation text,
  example text,
  comparison_table jsonb,
  related_terms text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,
  author_id uuid references public.profiles (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, slug)
);

create index if not exists glossary_terms_status_category_idx
  on public.glossary_terms (status, category, term);

-- Reusa la función set_updated_at() ya creada para posts/home_banner/etc.
drop trigger if exists glossary_terms_set_updated_at on public.glossary_terms;
create trigger glossary_terms_set_updated_at
  before update on public.glossary_terms
  for each row execute procedure public.set_updated_at();

alter table public.glossary_terms enable row level security;

drop policy if exists "public read published glossary_terms" on public.glossary_terms;
create policy "public read published glossary_terms" on public.glossary_terms
  for select using (status = 'published');

drop policy if exists "authenticated manage glossary_terms" on public.glossary_terms;
create policy "authenticated manage glossary_terms" on public.glossary_terms
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
