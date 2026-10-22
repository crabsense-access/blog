-- Problemas ("issues") de cada servicio del bloque "Nuestros servicios" de
-- la home: título, descripción y bullets de "Cómo te ayudamos". Editables
-- desde /admin/services. Si la tabla no existe o un servicio no tiene
-- filas, la home usa el contenido fijo del código como respaldo.
create table if not exists public.service_issues (
  id uuid primary key default gen_random_uuid(),
  service_slug text not null,
  sort_order integer not null default 0,
  title text not null,
  description text not null default '',
  help text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_issues_service_slug_idx
  on public.service_issues (service_slug, sort_order);

drop trigger if exists service_issues_set_updated_at on public.service_issues;
create trigger service_issues_set_updated_at
  before update on public.service_issues
  for each row execute procedure public.set_updated_at();

alter table public.service_issues enable row level security;

drop policy if exists "public read service_issues" on public.service_issues;
create policy "public read service_issues" on public.service_issues
  for select using (true);

drop policy if exists "authenticated manage service_issues" on public.service_issues;
create policy "authenticated manage service_issues" on public.service_issues
  for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- Carga inicial: el contenido que hoy está en el código (solo si la tabla
-- está vacía, para no duplicar si se vuelve a correr).
insert into public.service_issues (service_slug, sort_order, title, description, help)
select * from (values
  ('analytics', 0, 'GA4 no coincide con mis ventas reales', 'Las transacciones de Analytics no cierran con las de tu e-commerce, CRM o sistema de gestión, y ya no sabés qué número creer.', array['Auditamos la implementación completa de GA4 y GTM', 'Conciliamos transacciones contra tu plataforma de ventas', 'Corregimos duplicados, eventos rotos y compras perdidas']::text[]),
  ('analytics', 1, 'No sé qué canal me trae las ventas', 'Mucho tráfico directo o “(not set)”, UTMs desordenadas y la sensación de que cada plataforma se adjudica las mismas conversiones.', array['Definimos una convención de UTMs para todo el equipo', 'Configuramos agrupaciones de canales a tu medida', 'Resolvemos referidos de pasarelas de pago y cross-domain']::text[]),
  ('analytics', 2, 'Google Ads y Meta optimizan con datos equivocados', 'Conversiones duplicadas o que no llegan, y campañas que aprenden de señales incorrectas mientras el presupuesto se va igual.', array['Configuramos conversiones y enhanced conversions en Google Ads', 'Implementamos Meta Conversions API con deduplicación', 'Validamos cada evento antes de que impacte en las pujas']::text[]),
  ('analytics', 3, 'No sé qué botones y CTAs generan contactos', 'Tenés botones de WhatsApp, formularios, “Pedí tu cotización” y teléfono por todo el sitio, pero no sabés cuáles se usan ni cuáles terminan en una venta.', array['Medimos cada CTA: clics, formularios, WhatsApp y llamadas', 'Comparamos el rendimiento por botón, página y dispositivo', 'Te recomendamos qué cambiar y lo validamos con tests A/B']::text[]),
  ('analytics', 4, 'Tengo datos pero no sé qué hacer con ellos', 'Reportes eternos armados a mano cada mes, métricas que nadie mira y decisiones que se siguen tomando por intuición.', array['Definimos los KPIs que importan para tu negocio', 'Armamos dashboards automáticos en Looker Studio', 'Te acompañamos a convertir los datos en acciones']::text[]),
  ('seo', 0, 'Mi competencia aparece en Google y yo no', 'Buscás lo que vendés y aparecen otros primero, aunque tu producto o servicio sea igual o mejor.', array['Analizamos qué palabras buscan tus clientes y quién las gana hoy', 'Detectamos las brechas de contenido frente a tu competencia', 'Armamos un plan priorizado por impacto en ventas']::text[]),
  ('seo', 1, 'Perdí posiciones y no sé por qué', 'El tráfico orgánico cayó de un día para el otro: una actualización de Google, una migración o un cambio en el sitio que nadie midió.', array['Diagnosticamos la caída con Search Console y GA4', 'Corregimos errores técnicos de rastreo e indexación', 'Definimos un plan de recuperación con seguimiento semanal']::text[]),
  ('seo', 2, 'Publico contenido pero no posiciona', 'Escribís notas en el blog todos los meses, pero no aparecen en Google ni te traen consultas.', array['Diseñamos clusters de contenido alrededor de tus servicios', 'Creamos briefs con intención de búsqueda y estructura SEO', 'Actualizamos y reforzamos el contenido que ya tenés']::text[]),
  ('seo', 3, 'ChatGPT y la IA de Google no me mencionan', 'Cada vez más clientes le preguntan a la IA qué contratar, y tu marca no aparece en esas respuestas.', array['Optimizamos tu contenido para respuestas de IA (GEO)', 'Implementamos datos estructurados y señales de marca', 'Medimos cómo y cuándo te citan los asistentes de IA']::text[]),
  ('seo', 4, 'Tengo visitas pero no se convierten en clientes', 'El tráfico orgánico crece, pero llega a páginas que no venden o a gente que no está buscando comprar.', array['Alineamos cada página con la intención de búsqueda correcta', 'Mejoramos el enlazado interno hacia tus páginas de servicio', 'Optimizamos títulos, CTAs y contenido para convertir']::text[]),
  ('ads', 0, 'Invierto en Ads pero no sé si me conviene', 'Todos los meses pagás las campañas, pero no tenés claro cuántas ventas generan ni cuánto te devuelve cada peso invertido.', array['Verificamos que cada conversión se mida bien de punta a punta', 'Armamos reportes de ROAS y costo por venta por campaña', 'Movemos presupuesto hacia lo que realmente vende']::text[]),
  ('ads', 1, 'Mi costo por cliente no para de subir', 'Cada mes necesitás invertir más para conseguir los mismos resultados y no sabés dónde se está yendo la plata.', array['Auditamos estructura, palabras clave y exclusiones', 'Ajustamos estrategias de puja y segmentación', 'Mejoramos anuncios y landings para convertir más']::text[]),
  ('ads', 2, 'Las campañas automáticas son una caja negra', 'Performance Max y Advantage+ deciden solas dónde mostrar tus anuncios y no entendés qué está funcionando.', array['Abrimos los datos: búsquedas, ubicaciones y audiencias reales', 'Configuramos exclusiones y señales para guiar al algoritmo', 'Te explicamos los resultados en reportes claros']::text[]),
  ('ads', 3, 'Me llegan contactos que no sirven', 'Las campañas traen muchos formularios, pero la mayoría no califica y tu equipo comercial pierde tiempo.', array['Conectamos la calidad del lead con las plataformas (conversiones offline)', 'Refinamos audiencias y mensajes para atraer al cliente ideal', 'Agregamos filtros en los formularios sin perder volumen']::text[]),
  ('ads', 4, 'No sé en qué plataforma invertir', 'Google, Meta, LinkedIn… cada una promete resultados y no sabés cómo repartir tu presupuesto.', array['Definimos el mix de canales según tu embudo de ventas', 'Probamos con presupuestos controlados antes de escalar', 'Unificamos los resultados en un solo tablero']::text[])
) as v(service_slug, sort_order, title, description, help)
where not exists (select 1 from public.service_issues);
