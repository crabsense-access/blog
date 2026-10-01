-- Casos de éxito DE EJEMPLO (clientes y resultados ficticios) para ver la
-- sección armada en la home. Reemplazalos o borralos desde /admin/casos.
insert into public.success_cases
  (client_name, title, description, metric_value, metric_label, service, image_url, link_url, sort_order, is_published)
values
  ('Tienda Norte (ejemplo)',
   'Triplicamos las ventas online en seis meses',
   'Reordenamos la estructura de campañas en Google y Meta y medimos cada venta de punta a punta para invertir solo en lo que funciona.',
   'x3', 'ventas online en 6 meses', 'ads', '/casos/ejemplo-1.webp', null, 1, true),
  ('Andes Seguros (ejemplo)',
   'Pasamos de no aparecer a liderar las búsquedas de seguros',
   'SEO técnico, contenidos por intención de búsqueda y optimización para respuestas de IA en ChatGPT, Gemini y Perplexity.',
   '+180%', 'tráfico orgánico en un año', 'seo', '/casos/ejemplo-2.webp', null, 2, true),
  ('Grupo Delta (ejemplo)',
   'Datos confiables para decidir en qué invertir',
   'Auditamos GA4 y GTM, conciliamos las conversiones con el CRM y armamos un tablero único para dirección y marketing.',
   '98%', 'de las ventas atribuidas', 'analytics', '/casos/ejemplo-3.webp', null, 3, true);
