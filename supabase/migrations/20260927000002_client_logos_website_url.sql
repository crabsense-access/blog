-- URL del sitio de cada cliente (opcional), editable desde /admin/clients.
-- La usa el carrusel de logos del hero de la home: el logo linkea a su web.
alter table public.client_logos add column if not exists website_url text;
