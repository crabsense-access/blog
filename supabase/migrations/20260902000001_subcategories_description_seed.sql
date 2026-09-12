-- Carga descripciones de PRUEBA para las subcategorías existentes, solo para
-- poder ver el diseño de la tarjeta de categoría/subcategoría funcionando con
-- contenido real. Son textos breves inventados en base al nombre de cada
-- subcategoría — hay que reemplazarlos por la descripción real de cada una
-- antes de ir a producción.
--
-- Incluye el alter de la migración anterior (20260902000000) por las dudas
-- de que no se haya corrido todavía; es seguro re-ejecutarlo.
--
-- Se matchea por slug + category_id (no por slug solo) porque hay slugs
-- repetidos entre categorías distintas (ej: "geo" existe en SEO e IA).

alter table public.subcategories add column if not exists description text;

update public.subcategories set description =
  'Cómo la inteligencia artificial optimiza la creación, segmentación y puja de campañas publicitarias en tiempo real.'
where slug = 'ads-ia' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Ideas, formatos y buenas prácticas para crear piezas publicitarias que capten la atención y conviertan.'
where slug = 'creatividad' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Estrategias y configuración de campañas en Facebook e Instagram Ads para maximizar el retorno de inversión.'
where slug = 'meta-ads' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Guías sobre búsqueda, display, shopping y video para sacarle el máximo provecho a Google Ads.'
where slug = 'google-ads' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Formatos, segmentación y creatividades específicas para campañas publicitarias en Instagram.'
where slug = 'instagram-ads' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Técnicas para mejorar el rendimiento de campañas activas: pujas, audiencias, creatividades y presupuestos.'
where slug = 'optimizacion' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Cómo medir e incrementar el retorno sobre la inversión publicitaria en cada campaña.'
where slug = 'roas' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Métricas y metodologías para calcular el retorno de inversión real de las acciones de marketing.'
where slug = 'roi' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Uso de WhatsApp Business y campañas de click-to-WhatsApp como canal de conversión.'
where slug = 'whatsapp' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Estrategia, formatos y producción de contenido pensado para posicionar y atraer tráfico orgánico.'
where slug = 'contenido' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Métricas de rendimiento web (LCP, INP, CLS) y cómo optimizarlas para mejorar el posicionamiento.'
where slug = 'core-web-vitals' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Experiencia, autoridad y confianza: los pilares que Google evalúa para posicionar contenido de calidad.'
where slug = 'e-e-a-t' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'SEO aplicado a tiendas online: fichas de producto, categorías, filtros y arquitectura de catálogo.'
where slug = 'ecommerce-seo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Generative Engine Optimization: cómo optimizar contenido para aparecer en respuestas de IA generativa.'
where slug = 'geo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo usar Search Console para monitorear indexación, rendimiento y errores técnicos del sitio.'
where slug = 'google-search-console' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'El impacto de la inteligencia artificial en las búsquedas y cómo adaptar la estrategia SEO.'
where slug = 'ia-seo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo asegurar que Google rastree e indexe correctamente cada página relevante del sitio.'
where slug = 'indexacion' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Metodologías para encontrar y priorizar las palabras clave con mayor potencial de tráfico y conversión.'
where slug = 'keyword-research' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Crawl budget, robots.txt y sitemaps: cómo facilitarle a los buscadores el rastreo del sitio.'
where slug = 'rastreo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Buenas prácticas de redirecciones 301/302 para no perder autoridad ni tráfico en migraciones.'
where slug = 'redirecciones' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Fundamentos y estrategia integral de SEO para mejorar la visibilidad orgánica de un sitio.'
where slug = 'seo-general' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Estrategias de hreflang, dominios y contenido multilenguaje para posicionar en distintos países.'
where slug = 'seo-internacional' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo optimizar la presencia en Google Business Profile y las búsquedas locales para negocios físicos.'
where slug = 'seo-local' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Auditorías, arquitectura del sitio y rendimiento: la base técnica de una estrategia SEO sólida.'
where slug = 'seo-tecnico' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo distintos modelos de atribución explican el aporte de cada canal en el journey de conversión.'
where slug = 'modelos-de-atribucion' and category_id = (select id from public.categories where name = 'GA4');

update public.subcategories set description =
  'Armado de reportes y dashboards en GA4 para tomar decisiones basadas en datos.'
where slug = 'reportes' and category_id = (select id from public.categories where name = 'GA4');

update public.subcategories set description =
  'Análisis de comportamiento, segmentación y journey de usuarios dentro de Google Analytics 4.'
where slug = 'usuarios' and category_id = (select id from public.categories where name = 'GA4');

update public.subcategories set description =
  'Casos de uso de Claude, el modelo de IA de Anthropic, aplicados a marketing y contenido.'
where slug = 'geo' and category_id = (select id from public.categories where name = 'IA');
