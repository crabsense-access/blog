-- Esquema inicial para el sitio institucional + blog.
-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor > New query).

-- ============ Extensiones ============
create extension if not exists "pgcrypto";

-- ============ Sistema de etiquetas (eliminado, reemplazado por subcategorías) ============
-- Si tu base ya tenía el sistema de tags de una corrida anterior de este
-- schema, esto lo elimina por completo (tablas + policies). Reemplazado por
-- subcategories/post_subcategories más abajo.
drop table if exists public.category_tags cascade;
drop table if exists public.post_tags cascade;
drop table if exists public.tags cascade;

-- ============ Categorías múltiples por post (revertido a categoría única) ============
-- Se probó una relación muchas-a-muchas (post_categories); se volvió a una
-- única "categoría principal" por post (posts.category_id, más abajo).
drop table if exists public.post_categories cascade;

-- ============ Perfiles (rol de admin sobre auth.users, y/o autores del blog) ============
-- id ya NO tiene foreign key hacia auth.users: además de las cuentas reales
-- de admin/editor (creadas vía el trigger de abajo), esta tabla también
-- guarda autores "solo de contenido" para las notas del blog, sin login.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  public_title text,
  bio text,
  avatar_url text,
  is_featured_expert boolean not null default false,
  featured_position int,
  linkedin_url text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

-- Si la tabla ya existe, descomenta y ejecutá:
-- alter table public.profiles add column if not exists email text;
-- update public.profiles p set email = u.email from auth.users u where p.id = u.id and p.email is null;
-- alter table public.profiles add column if not exists public_title text;
-- alter table public.profiles add column if not exists avatar_url text;
-- alter table public.profiles add column if not exists is_featured_expert boolean not null default false;
-- alter table public.profiles add column if not exists featured_position int;
-- alter table public.profiles add column if not exists linkedin_url text;

-- bio: descripción del autor mostrada en /blog/autor/[id].
alter table public.profiles add column if not exists bio text;
-- alter table public.profiles drop constraint if exists profiles_id_fkey;
-- alter table public.profiles alter column id set default gen_random_uuid();

-- Crea automáticamente un profile cuando se registra un usuario nuevo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
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
  pill_color text,
  parent_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Si la tabla ya existe, descomenta y ejecutá:
-- alter table public.categories add column if not exists pill_color text;

-- parent_id: null = "Categoría principal"; con valor = "categoría adicional"
-- que cuelga de esa categoría principal (jerarquía de un solo nivel).
alter table public.categories
  add column if not exists parent_id uuid references public.categories (id) on delete set null;
create index if not exists categories_parent_id_idx on public.categories (parent_id);

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
  is_featured boolean not null default false,
  is_popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Si la tabla ya existe, descomenta y ejecuta las siguientes líneas:
-- alter table public.posts add column if not exists is_featured boolean not null default false;
-- alter table public.posts add column if not exists is_popular boolean not null default false;

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

-- ============ Subcategorías (cada una pertenece a una única categoría) ============
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);
create index if not exists subcategories_category_id_idx on public.subcategories (category_id);

-- ============ Relación posts <-> subcategorías (muchas a muchas) ============
create table if not exists public.post_subcategories (
  post_id uuid not null references public.posts (id) on delete cascade,
  subcategory_id uuid not null references public.subcategories (id) on delete cascade,
  primary key (post_id, subcategory_id)
);
create index if not exists post_subcategories_subcategory_id_idx
  on public.post_subcategories (subcategory_id);

-- ============ Bloques de categoría (3 bloques fijos configurables de /blog) ============
create table if not exists public.category_blocks (
  position int primary key check (position in (1, 2, 3)),
  category_id uuid references public.categories (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.category_blocks (position) values (1), (2), (3)
on conflict (position) do nothing;

-- Si la tabla ya existe con las columnas de banner (versión anterior),
-- descomenta y ejecutá para sacarlas:
-- alter table public.category_blocks drop column if exists banner_title;
-- alter table public.category_blocks drop column if exists banner_image_url;
-- alter table public.category_blocks drop column if exists banner_link_url;

drop trigger if exists category_blocks_set_updated_at on public.category_blocks;
create trigger category_blocks_set_updated_at
  before update on public.category_blocks
  for each row execute procedure public.set_updated_at();

-- ============ Banner de la home (fila única) ============
create table if not exists public.home_banner (
  id boolean primary key default true,
  title text not null default 'Título del banner',
  image_url text,
  link_url text,
  updated_at timestamptz not null default now(),
  constraint home_banner_singleton check (id)
);

insert into public.home_banner (id) values (true) on conflict (id) do nothing;

drop trigger if exists home_banner_set_updated_at on public.home_banner;
create trigger home_banner_set_updated_at
  before update on public.home_banner
  for each row execute procedure public.set_updated_at();

-- ============ Row Level Security ============
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.posts enable row level security;
alter table public.post_subcategories enable row level security;
alter table public.home_banner enable row level security;
alter table public.category_blocks enable row level security;

-- Lectura pública: cualquiera puede ver posts publicados, categorías y subcategorías.
-- (drop + create en vez de "create policy if not exists" porque Postgres no
-- soporta esa cláusula para policies — así el script se puede re-correr.)
drop policy if exists "public read published posts" on public.posts;
create policy "public read published posts" on public.posts
  for select using (status = 'published');

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "public read subcategories" on public.subcategories;
create policy "public read subcategories" on public.subcategories
  for select using (true);

drop policy if exists "public read post_subcategories" on public.post_subcategories;
create policy "public read post_subcategories" on public.post_subcategories
  for select using (true);

-- Perfiles: lectura pública (se usa para mostrar el nombre del autor en el sitio).
drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles
  for select using (true);

drop policy if exists "public read home_banner" on public.home_banner;
create policy "public read home_banner" on public.home_banner
  for select using (true);

drop policy if exists "public read category_blocks" on public.category_blocks;
create policy "public read category_blocks" on public.category_blocks
  for select using (true);

-- Si la tabla ya existía con la policy anterior, descomenta y ejecutá:
-- drop policy if exists "users read own profile" on public.profiles;

-- Cada usuario puede editar su propio profile (ej. public_title).
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cualquier autenticado (admin/editor) puede gestionar cualquier profile,
-- incluidos los autores "solo de contenido" sin cuenta de login.
drop policy if exists "authenticated manage profiles" on public.profiles;
create policy "authenticated manage profiles" on public.profiles
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Admins/editores autenticados: acceso total a posts, categorías y subcategorías.
-- (el service role key del backend también bypassea RLS si hiciera falta)
drop policy if exists "authenticated manage posts" on public.posts;
create policy "authenticated manage posts" on public.posts
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated manage categories" on public.categories;
create policy "authenticated manage categories" on public.categories
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated manage subcategories" on public.subcategories;
create policy "authenticated manage subcategories" on public.subcategories
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated manage post_subcategories" on public.post_subcategories;
create policy "authenticated manage post_subcategories" on public.post_subcategories
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated manage home_banner" on public.home_banner;
create policy "authenticated manage home_banner" on public.home_banner
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

drop policy if exists "authenticated manage category_blocks" on public.category_blocks;
create policy "authenticated manage category_blocks" on public.category_blocks
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============ Primer usuario admin ============
-- Después de registrarte una vez desde /login (o desde el dashboard de
-- Supabase > Authentication > Users), promové tu usuario a admin:
--   update public.profiles set role = 'admin' where id = '<tu-user-id>';

-- ============ Storage: bucket de avatares de autores ============
-- Los buckets no son tablas de public, viven en el schema storage. Se pueden
-- crear con SQL igual que cualquier otra tabla (storage.buckets/storage.objects
-- son tablas reales), corriendo esto una sola vez (podés pegarlo en el SQL
-- Editor del dashboard, o correrlo con el CLI: supabase db query --linked):
--
-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true)
-- on conflict (id) do nothing;
--
-- create policy "public read avatars" on storage.objects
--   for select using (bucket_id = 'avatars');
--
-- create policy "authenticated manage avatars" on storage.objects
--   for all using (bucket_id = 'avatars' and auth.uid() is not null)
--   with check (bucket_id = 'avatars' and auth.uid() is not null);
--
-- Si no tenés permisos para correr esto por SQL (algunos proyectos restringen
-- el schema storage), hacelo manualmente desde Storage > New bucket en el
-- dashboard: nombre "avatars", marcá "Public bucket", y en Policies agregá
-- una de lectura pública y otra de escritura para usuarios autenticados.
