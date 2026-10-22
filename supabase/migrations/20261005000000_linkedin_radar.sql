-- Radar de novedades para LinkedIn (/admin/linkedin/radar).
-- Cada 3 días un cron (vercel.json → /api/cron/radar) le pide a la IA las 6
-- novedades más relevantes de GA4, Google Ads, Meta/Instagram Ads, SEO y GEO
-- (priorizando fuentes oficiales) y las guarda acá para elegir cuáles se
-- convierten en post (tipo II · Novedad de producto).

create table if not exists public.news_scans (
  id uuid primary key default gen_random_uuid(),
  trigger text not null default 'manual' check (trigger in ('cron', 'manual')),
  status text not null default 'running' check (status in ('running', 'done', 'error')),
  error text,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references public.news_scans (id) on delete cascade,
  platform text not null,
  -- servicio de Crabsense → color de la pill (analytics | seo | ads | ia)
  service text not null default 'analytics' check (service in ('analytics', 'seo', 'ads', 'ia')),
  title text not null,
  summary text not null default '',
  why_it_matters text not null default '',
  ai_angle text,
  source_url text not null,
  source_name text,
  source_type text not null default 'official' check (source_type in ('official', 'expert')),
  source_language text not null default 'en',
  published_date date,
  relevance smallint not null default 3 check (relevance between 1 and 5),
  -- referentes que tratan el mismo tema: [{title, url, source, type, summary}]
  related_links jsonb not null default '[]'::jsonb,
  related_fetched_at timestamptz,
  status text not null default 'new' check (status in ('new', 'selected', 'discarded', 'used')),
  linkedin_post_id uuid references public.linkedin_posts (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (source_url)
);

create index if not exists news_items_scan_idx on public.news_items (scan_id, relevance desc);
create index if not exists news_items_status_idx on public.news_items (status, created_at desc);

alter table public.news_scans enable row level security;
alter table public.news_items enable row level security;

drop policy if exists "authenticated manage news_scans" on public.news_scans;
create policy "authenticated manage news_scans" on public.news_scans
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated manage news_items" on public.news_items;
create policy "authenticated manage news_items" on public.news_items
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Calendario + plantilla visual del tipo II en linkedin_posts
alter table public.linkedin_posts add column if not exists scheduled_time time;
alter table public.linkedin_posts add column if not exists news_item_id uuid references public.news_items (id) on delete set null;
-- Datos estructurados de plantillas con diseño propio (tipo II: portada,
-- antes/ahora, letra chica, pasos, nuestra lectura). Ver src/lib/linkedin-update.ts
alter table public.linkedin_posts add column if not exists template_data jsonb;
