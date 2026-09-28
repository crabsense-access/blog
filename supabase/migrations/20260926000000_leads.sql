-- Leads del bloque "¿Qué proyecto tenés en mente hoy?" del hero de la home.
-- Los visitantes (anon) solo pueden INSERTAR; leer/gestionar requiere sesión.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  services text[] not null default '{}',
  message text not null default '',
  contact text not null,
  contact_type text not null check (contact_type in ('email', 'phone')),
  page_path text,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'descartado')),
  constraint leads_services_valid check (services <@ array['seo', 'ads', 'analytics', 'ia']::text[]),
  constraint leads_message_len check (char_length(message) <= 2000),
  constraint leads_contact_len check (char_length(contact) between 5 and 160)
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

drop policy if exists "public insert leads" on public.leads;
create policy "public insert leads" on public.leads
  for insert to anon, authenticated with check (status = 'nuevo');

drop policy if exists "authenticated manage leads" on public.leads;
create policy "authenticated manage leads" on public.leads
  for all using (auth.uid() is not null) with check (auth.uid() is not null);
