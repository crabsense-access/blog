-- Extiende las descripciones de PRUEBA de las subcategorías (cargadas en
-- 20260902000001) a párrafos más completos (2-3 oraciones), para tener mejor
-- referencia visual en la tarjeta de categoría/subcategoría. Siguen siendo
-- contenido inventado, a reemplazar por la descripción real de cada una
-- antes de ir a producción.
--
-- Se matchea por slug + category_id (no por slug solo) porque hay slugs
-- repetidos entre categorías distintas (ej: "geo" existe en SEO e IA).

update public.subcategories set description =
  'Cómo la inteligencia artificial optimiza la creación, segmentación y puja de campañas publicitarias en tiempo real. Desde la generación automática de creatividades hasta el ajuste dinámico de presupuestos, estas herramientas están cambiando la forma de gestionar la pauta. Acá reunimos casos de uso concretos y las plataformas que ya lo están aplicando.'
where slug = 'ads-ia' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Ideas, formatos y buenas prácticas para crear piezas publicitarias que capten la atención y conviertan. Analizamos qué elementos visuales y de copy funcionan mejor según el objetivo de la campaña y la plataforma donde se publica. También compartimos ejemplos reales y tendencias de formato que están dando resultado.'
where slug = 'creatividad' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Estrategias y configuración de campañas en Facebook e Instagram Ads para maximizar el retorno de inversión. Cubrimos desde la estructura de cuentas y públicos hasta la optimización de presupuestos y creatividades dentro del ecosistema de Meta. Ideal para quienes buscan sacarle más provecho a cada peso invertido en estas plataformas.'
where slug = 'meta-ads' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Guías sobre búsqueda, display, shopping y video para sacarle el máximo provecho a Google Ads. Explicamos cómo estructurar campañas, elegir palabras clave y ajustar pujas para mejorar el rendimiento sin disparar el costo por adquisición. También revisamos las novedades de la plataforma y su impacto en la estrategia.'
where slug = 'google-ads' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Formatos, segmentación y creatividades específicas para campañas publicitarias en Instagram. Repasamos qué funciona en Stories, Reels y feed, y cómo adaptar el mensaje a cada formato para no perder efectividad. Sumamos recomendaciones para optimizar el presupuesto en una plataforma cada vez más visual.'
where slug = 'instagram-ads' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Técnicas para mejorar el rendimiento de campañas activas: pujas, audiencias, creatividades y presupuestos. Analizamos cómo interpretar las métricas clave para saber qué palancas mover y cuándo. El objetivo es siempre el mismo: más resultados con el mismo presupuesto, o el mismo resultado con menos inversión.'
where slug = 'optimizacion' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Cómo medir e incrementar el retorno sobre la inversión publicitaria en cada campaña. Explicamos las fórmulas, los benchmarks por industria y los errores más comunes al interpretar esta métrica. También compartimos tácticas concretas para mejorar el ROAS sin sacrificar volumen.'
where slug = 'roas' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Métricas y metodologías para calcular el retorno de inversión real de las acciones de marketing. Vamos más allá de las plataformas publicitarias para entender el impacto de cada canal en el negocio. Incluye modelos de cálculo y ejemplos aplicados a distintos tipos de empresa.'
where slug = 'roi' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Uso de WhatsApp Business y campañas de click-to-WhatsApp como canal de conversión. Repasamos cómo integrar este canal a la estrategia de pauta y qué automatizaciones ayudan a no perder leads. También compartimos casos de éxito de marcas que lo usan como canal principal de ventas.'
where slug = 'whatsapp' and category_id = (select id from public.categories where name = 'ADS');

update public.subcategories set description =
  'Estrategia, formatos y producción de contenido pensado para posicionar y atraer tráfico orgánico. Analizamos cómo planificar un calendario editorial que combine intención de búsqueda con los objetivos de negocio. También compartimos buenas prácticas de redacción y estructura para que el contenido realmente posicione.'
where slug = 'contenido' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Métricas de rendimiento web (LCP, INP, CLS) y cómo optimizarlas para mejorar el posicionamiento. Explicamos qué mide cada una, por qué le importan a Google y qué cambios técnicos suelen tener más impacto. Ideal para equipos que buscan mejorar la experiencia del usuario sin perder de vista el SEO.'
where slug = 'core-web-vitals' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Experiencia, autoridad y confianza: los pilares que Google evalúa para posicionar contenido de calidad. Repasamos cómo demostrar estas señales en un sitio, desde la autoría del contenido hasta las menciones externas. Cada vez más relevante en un contexto donde la IA generativa también evalúa estas señales.'
where slug = 'e-e-a-t' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'SEO aplicado a tiendas online: fichas de producto, categorías, filtros y arquitectura de catálogo. Analizamos los desafíos técnicos propios del ecommerce, como el contenido duplicado por filtros o la indexación de productos sin stock. También compartimos estrategias para posicionar categorías altamente competitivas.'
where slug = 'ecommerce-seo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Generative Engine Optimization: cómo optimizar contenido para aparecer en respuestas de IA generativa. Explicamos qué señales priorizan modelos como ChatGPT, Perplexity o las AI Overviews de Google al elegir qué citar. Una disciplina nueva que está redefiniendo cómo pensamos la visibilidad online.'
where slug = 'geo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo usar Search Console para monitorear indexación, rendimiento y errores técnicos del sitio. Repasamos los reportes más útiles para detectar problemas antes de que impacten en el tráfico orgánico. También compartimos tips para sacarle más provecho a una herramienta gratuita pero subutilizada.'
where slug = 'google-search-console' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'El impacto de la inteligencia artificial en las búsquedas y cómo adaptar la estrategia SEO. Analizamos cambios como las AI Overviews, la búsqueda conversacional y el uso de IA en la investigación de keywords y creación de contenido. Todo pensado para que la estrategia SEO no quede desactualizada frente a estos cambios.'
where slug = 'ia-seo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo asegurar que Google rastree e indexe correctamente cada página relevante del sitio. Explicamos las causas más comunes de problemas de indexación y cómo diagnosticarlas con las herramientas adecuadas. Un paso técnico fundamental antes de pensar en cualquier otra estrategia de contenido.'
where slug = 'indexacion' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Metodologías para encontrar y priorizar las palabras clave con mayor potencial de tráfico y conversión. Repasamos herramientas, criterios de priorización y cómo cruzar volumen de búsqueda con intención real del usuario. También compartimos cómo adaptar la investigación de keywords a la búsqueda conversacional.'
where slug = 'keyword-research' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Crawl budget, robots.txt y sitemaps: cómo facilitarle a los buscadores el rastreo del sitio. Explicamos cómo identificar problemas de rastreo en sitios grandes y qué configuraciones ayudan a priorizar las páginas más importantes. Un aspecto técnico clave para que el contenido de calidad realmente llegue a indexarse.'
where slug = 'rastreo' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Buenas prácticas de redirecciones 301/302 para no perder autoridad ni tráfico en migraciones. Repasamos los errores más comunes al planificar una migración de URLs y cómo evitarlos. También compartimos cómo monitorear el impacto de las redirecciones después de implementarlas.'
where slug = 'redirecciones' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Fundamentos y estrategia integral de SEO para mejorar la visibilidad orgánica de un sitio. Cubrimos los tres pilares clásicos —técnico, contenido y autoridad— con una mirada actualizada a los cambios recientes del ecosistema de búsqueda. Un buen punto de partida para quienes están armando su estrategia desde cero.'
where slug = 'seo-general' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Estrategias de hreflang, dominios y contenido multilenguaje para posicionar en distintos países. Explicamos cómo elegir la estructura de URLs adecuada y evitar errores comunes de implementación de hreflang. Pensado para marcas que buscan expandir su presencia orgánica a nuevos mercados.'
where slug = 'seo-internacional' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo optimizar la presencia en Google Business Profile y las búsquedas locales para negocios físicos. Repasamos qué señales importan para aparecer en el pack local y cómo gestionar reseñas y citaciones. Ideal para negocios que dependen del tráfico de proximidad para captar clientes.'
where slug = 'seo-local' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Auditorías, arquitectura del sitio y rendimiento: la base técnica de una estrategia SEO sólida. Analizamos cómo detectar y priorizar problemas técnicos que están frenando el posicionamiento. Sin una base técnica sana, ninguna estrategia de contenido o autoridad logra su máximo potencial.'
where slug = 'seo-tecnico' and category_id = (select id from public.categories where name = 'SEO');

update public.subcategories set description =
  'Cómo distintos modelos de atribución explican el aporte de cada canal en el journey de conversión. Comparamos modelos como último clic, lineal y basado en datos, y cuándo conviene usar cada uno. Fundamental para entender qué canales realmente están generando resultados.'
where slug = 'modelos-de-atribucion' and category_id = (select id from public.categories where name = 'GA4');

update public.subcategories set description =
  'Armado de reportes y dashboards en GA4 para tomar decisiones basadas en datos. Repasamos cómo elegir las métricas correctas según el objetivo del negocio y evitar reportes sobrecargados de información. También compartimos plantillas y buenas prácticas de visualización.'
where slug = 'reportes' and category_id = (select id from public.categories where name = 'GA4');

update public.subcategories set description =
  'Análisis de comportamiento, segmentación y journey de usuarios dentro de Google Analytics 4. Explicamos cómo construir audiencias relevantes y detectar patrones de comportamiento que ayuden a mejorar la experiencia. Clave para tomar decisiones de producto y marketing basadas en datos reales.'
where slug = 'usuarios' and category_id = (select id from public.categories where name = 'GA4');

update public.subcategories set description =
  'Casos de uso de Claude, el modelo de IA de Anthropic, aplicados a marketing y contenido. Repasamos cómo equipos de marketing lo usan para investigación, generación de borradores y análisis de datos. También compartimos comparativas frente a otros modelos y buenas prácticas de prompting.'
where slug = 'geo' and category_id = (select id from public.categories where name = 'IA');
