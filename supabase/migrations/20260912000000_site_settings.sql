-- Configuración general del sitio (singleton, mismo patrón que home_banner).
create table if not exists public.site_settings (
  id boolean primary key default true,
  category_page_initial_items int not null default 10,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id)
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute procedure public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "public read site_settings" on public.site_settings;
create policy "public read site_settings" on public.site_settings
  for select using (true);

drop policy if exists "authenticated manage site_settings" on public.site_settings;
create policy "authenticated manage site_settings" on public.site_settings
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
