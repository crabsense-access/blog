-- Esquema inicial para el sitio institucional + blog.
-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query).

-- ============ Extensiones ============
create extension if not exists "pgcrypto";

-- ============ Perfiles (rol de admin sobre auth.users) ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- Crea automáticamente un profile cuando se registra un usuario nuevo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ Categorías ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

-- ============ Tags ============
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ============ Posts ============
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);
create index if not exists posts_category_id_idx on public.posts (category_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

-- ============ Relación posts <-> tags ============
create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ============ Row Level Security ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.posts enable row level security;
alter table public.post_tags enable row level security;

-- Lectura pública: cualquiera puede ver posts publicados, categorías y tags.
create policy "public read published posts" on public.posts
  for select using (status = 'published');

create policy "public read categories" on public.categories
  for select using (true);

create policy "public read tags" on public.tags
  for select using (true);

create policy "public read post_tags" on public.post_tags
  for select using (true);

-- Perfiles: cada usuario ve su propio perfil.
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Admins/editores autenticados: acceso total a posts, categorías y tags.
-- (el service role key del backend también bypassea RLS si hiciera falta)
create policy "authenticated manage posts" on public.posts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated manage categories" on public.categories
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated manage tags" on public.tags
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

create policy "authenticated manage post_tags" on public.post_tags
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============ Primer usuario admin ============
-- Después de registrarte una vez desde /login (o desde el dashboard de
-- Supabase > Authentication > Users), promové tu usuario a admin:
--   update public.profiles set role = 'admin' where id = '<tu-user-id>';
