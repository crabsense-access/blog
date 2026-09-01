-- Carga bios de PRUEBA para los autores existentes, solo para poder ver el
-- diseño de la tarjeta de autor funcionando con contenido real. Son datos
-- inventados en base al nombre y public_title de cada uno — hay que
-- reemplazarlos por las bios reales de cada autor antes de ir a producción.
--
-- Incluye el alter de la migración anterior (20260901000004) por las dudas
-- de que no se haya corrido todavía; es seguro re-ejecutarlo.

alter table public.profiles add column if not exists bio text;

update public.profiles set bio =
  'Martina lidera la estrategia de SEO en Crabsense hace más de 6 años, especializándose en arquitectura de sitios, investigación de keywords y optimización técnica a gran escala. Antes de sumarse al equipo, trabajó como consultora SEO para e-commerces y medios digitales en Latinoamérica.

Es una convencida de que el buen SEO empieza por entender a las personas, no a los algoritmos, y dedica buena parte de su tiempo a formar equipos de contenido para que piensen en términos de intención de búsqueda.'
where full_name = 'Martina Suárez';

update public.profiles set bio =
  'Lucas es Data Analyst en Crabsense y se especializa en armar dashboards y modelos de atribución que ayudan a los equipos de marketing a tomar decisiones basadas en datos reales, no en intuición. Viene del mundo de la ingeniería de datos y disfruta particularmente de encontrar patrones donde nadie más los ve.

Cuando no está mirando reportes de Google Analytics 4, escribe sobre buenas prácticas de medición y cómo evitar los errores más comunes al interpretar métricas.'
where full_name = 'Lucas Ferrari';

update public.profiles set bio =
  'Camila es Content Specialist y se encarga de que cada nota del blog combine investigación seria con una lectura amena. Tiene formación en periodismo digital y varios años de experiencia escribiendo para marcas B2B y B2C.

Le interesa especialmente cómo la inteligencia artificial está cambiando la forma en que se produce y se consume contenido, y busca compartir ese aprendizaje en cada artículo que publica.'
where full_name = 'Camila Rossi';

update public.profiles set bio =
  'Nicolás lidera el área de Growth & Ads en Crabsense, donde diseña y optimiza campañas de performance en Google, Meta y otras plataformas. Tiene más de 8 años de experiencia gestionando presupuestos publicitarios para empresas de distintos tamaños y verticales.

Su foco está en la eficiencia: cómo lograr más resultados con el mismo presupuesto, y cómo anticiparse a los cambios que trae la publicidad post-cookies.'
where full_name = 'Nicolás Beltrán';

update public.profiles set bio =
  'Sofía lidera la investigación en inteligencia artificial aplicada al marketing digital en Crabsense. Con formación en ciencia de datos, se dedica a explorar cómo los modelos de lenguaje y las herramientas de IA generativa están transformando el SEO, la creación de contenido y la publicidad.

Es una voz frecuente en el blog sobre GEO (Generative Engine Optimization) y sobre cómo prepararse para un ecosistema de búsqueda cada vez más conversacional.'
where full_name = 'Sofía Larrea';
