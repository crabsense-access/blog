import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { CutoutImage } from "@/components/site/cutout-image";
import { HeroPromptBox } from "@/components/site/hero-prompt-box";
import { HeroSolaris } from "@/components/site/hero-solaris";
import { TagPill } from "@/components/site/tag-pill";
import type { LeadService } from "@/lib/validations/lead";
import type { ServiceImage } from "@/lib/services";

interface ServiceIssue {
  /** el dolor de cabeza, en palabras del cliente */
  title: string;
  description: string;
  /** cómo lo resolvemos */
  help: string[];
}

interface Service {
  id: string;
  name: string;
  /** mismo color que la categoría del blog (pill_color en Supabase) */
  color: string;
  /** bloque de prompt debajo de la imagen */
  prompt: { question: string; placeholder: string; service: LeadService };
  tagline: string;
  description: string;
  tools: string[];
  cta: { label: string; href: string };
  issues: ServiceIssue[];
}

// Contenido fijo por ahora (se puede mover al admin más adelante).
// Orden: Analytics, SEO & GEO, ADS; el resto de los servicios se suman acá.
const SERVICES: Service[] = [
  {
    id: "analytics",
    name: "Analytics",
    // color de la categoría GA4 del blog
    color: "#53539b",
    prompt: {
      question: "¿Qué querés medir mejor en tu negocio?",
      placeholder:
        "Ej.: GA4 no coincide con mis ventas, no sé qué canal convierte…",
      service: "analytics",
    },
    tagline: "Datos en los que podés confiar para decidir",
    description:
      "Implementamos, auditamos y ordenamos tu medición en GA4 y Google Tag Manager para que cada peso invertido en marketing se pueda seguir de punta a punta: del primer clic a la venta.",
    tools: [
      "GA4",
      "Google Tag Manager",
      "Looker Studio",
      "Consent Mode",
      "Server-side",
    ],
    cta: { label: "Quiero ordenar mis datos", href: "/contacto" },
    issues: [
      {
        title: "GA4 no coincide con mis ventas reales",
        description:
          "Las transacciones de Analytics no cierran con las de tu e-commerce, CRM o sistema de gestión, y ya no sabés qué número creer.",
        help: [
          "Auditamos la implementación completa de GA4 y GTM",
          "Conciliamos transacciones contra tu plataforma de ventas",
          "Corregimos duplicados, eventos rotos y compras perdidas",
        ],
      },
      {
        title: "No sé qué canal me trae las ventas",
        description:
          "Mucho tráfico directo o “(not set)”, UTMs desordenadas y la sensación de que cada plataforma se adjudica las mismas conversiones.",
        help: [
          "Definimos una convención de UTMs para todo el equipo",
          "Configuramos agrupaciones de canales a tu medida",
          "Resolvemos referidos de pasarelas de pago y cross-domain",
        ],
      },
      {
        title: "Google Ads y Meta optimizan con datos equivocados",
        description:
          "Conversiones duplicadas o que no llegan, y campañas que aprenden de señales incorrectas mientras el presupuesto se va igual.",
        help: [
          "Configuramos conversiones y enhanced conversions en Google Ads",
          "Implementamos Meta Conversions API con deduplicación",
          "Validamos cada evento antes de que impacte en las pujas",
        ],
      },
      {
        title: "No sé qué botones y CTAs generan contactos",
        description:
          "Tenés botones de WhatsApp, formularios, “Pedí tu cotización” y teléfono por todo el sitio, pero no sabés cuáles se usan ni cuáles terminan en una venta.",
        help: [
          "Medimos cada CTA: clics, formularios, WhatsApp y llamadas",
          "Comparamos el rendimiento por botón, página y dispositivo",
          "Te recomendamos qué cambiar y lo validamos con tests A/B",
        ],
      },
      {
        title: "Tengo datos pero no sé qué hacer con ellos",
        description:
          "Reportes eternos armados a mano cada mes, métricas que nadie mira y decisiones que se siguen tomando por intuición.",
        help: [
          "Definimos los KPIs que importan para tu negocio",
          "Armamos dashboards automáticos en Looker Studio",
          "Te acompañamos a convertir los datos en acciones",
        ],
      },
    ],
  },
  {
    id: "seo",
    name: "SEO & GEO",
    // color de la categoría SEO del blog
    color: "#3f787e",
    prompt: {
      question: "¿Qué búsquedas querés ganar en Google y en la IA?",
      placeholder:
        "Ej.: mi competencia aparece primero, perdí tráfico orgánico…",
      service: "seo",
    },
    tagline: "Que te encuentren en Google y en las respuestas de IA",
    description:
      "Posicionamiento orgánico técnico y de contenidos para aparecer cuando tus clientes buscan lo que vendés, en Google, ChatGPT, Gemini y Perplexity.",
    tools: ["Search Console", "GA4", "Datos estructurados", "GEO"],
    cta: { label: "Quiero posicionar mi sitio", href: "/contacto" },
    issues: [
      {
        title: "Mi competencia aparece en Google y yo no",
        description:
          "Buscás lo que vendés y aparecen otros primero, aunque tu producto o servicio sea igual o mejor.",
        help: [
          "Analizamos qué palabras buscan tus clientes y quién las gana hoy",
          "Detectamos las brechas de contenido frente a tu competencia",
          "Armamos un plan priorizado por impacto en ventas",
        ],
      },
      {
        title: "Perdí posiciones y no sé por qué",
        description:
          "El tráfico orgánico cayó de un día para el otro: una actualización de Google, una migración o un cambio en el sitio que nadie midió.",
        help: [
          "Diagnosticamos la caída con Search Console y GA4",
          "Corregimos errores técnicos de rastreo e indexación",
          "Definimos un plan de recuperación con seguimiento semanal",
        ],
      },
      {
        title: "Publico contenido pero no posiciona",
        description:
          "Escribís notas en el blog todos los meses, pero no aparecen en Google ni te traen consultas.",
        help: [
          "Diseñamos clusters de contenido alrededor de tus servicios",
          "Creamos briefs con intención de búsqueda y estructura SEO",
          "Actualizamos y reforzamos el contenido que ya tenés",
        ],
      },
      {
        title: "ChatGPT y la IA de Google no me mencionan",
        description:
          "Cada vez más clientes le preguntan a la IA qué contratar, y tu marca no aparece en esas respuestas.",
        help: [
          "Optimizamos tu contenido para respuestas de IA (GEO)",
          "Implementamos datos estructurados y señales de marca",
          "Medimos cómo y cuándo te citan los asistentes de IA",
        ],
      },
      {
        title: "Tengo visitas pero no se convierten en clientes",
        description:
          "El tráfico orgánico crece, pero llega a páginas que no venden o a gente que no está buscando comprar.",
        help: [
          "Alineamos cada página con la intención de búsqueda correcta",
          "Mejoramos el enlazado interno hacia tus páginas de servicio",
          "Optimizamos títulos, CTAs y contenido para convertir",
        ],
      },
    ],
  },
  {
    id: "ads",
    name: "ADS",
    // color de la categoría ADS del blog
    color: "#4ba5b9",
    prompt: {
      question: "¿Qué querés lograr con tus campañas?",
      placeholder:
        "Ej.: bajar el costo por cliente, vender más con el mismo presupuesto…",
      service: "ads",
    },
    tagline: "Campañas que se miden en ventas, no en clics",
    description:
      "Planificación y gestión de campañas en Google, Meta y LinkedIn Ads, con foco en costo por adquisición y retorno de la inversión.",
    tools: ["Google Ads", "Meta Ads", "LinkedIn Ads", "GA4"],
    cta: { label: "Quiero mejorar mis campañas", href: "/contacto" },
    issues: [
      {
        title: "Invierto en Ads pero no sé si me conviene",
        description:
          "Todos los meses pagás las campañas, pero no tenés claro cuántas ventas generan ni cuánto te devuelve cada peso invertido.",
        help: [
          "Verificamos que cada conversión se mida bien de punta a punta",
          "Armamos reportes de ROAS y costo por venta por campaña",
          "Movemos presupuesto hacia lo que realmente vende",
        ],
      },
      {
        title: "Mi costo por cliente no para de subir",
        description:
          "Cada mes necesitás invertir más para conseguir los mismos resultados y no sabés dónde se está yendo la plata.",
        help: [
          "Auditamos estructura, palabras clave y exclusiones",
          "Ajustamos estrategias de puja y segmentación",
          "Mejoramos anuncios y landings para convertir más",
        ],
      },
      {
        title: "Las campañas automáticas son una caja negra",
        description:
          "Performance Max y Advantage+ deciden solas dónde mostrar tus anuncios y no entendés qué está funcionando.",
        help: [
          "Abrimos los datos: búsquedas, ubicaciones y audiencias reales",
          "Configuramos exclusiones y señales para guiar al algoritmo",
          "Te explicamos los resultados en reportes claros",
        ],
      },
      {
        title: "Me llegan contactos que no sirven",
        description:
          "Las campañas traen muchos formularios, pero la mayoría no califica y tu equipo comercial pierde tiempo.",
        help: [
          "Conectamos la calidad del lead con las plataformas (conversiones offline)",
          "Refinamos audiencias y mensajes para atraer al cliente ideal",
          "Agregamos filtros en los formularios sin perder volumen",
        ],
      },
      {
        title: "No sé en qué plataforma invertir",
        description:
          "Google, Meta, LinkedIn… cada una promete resultados y no sabés cómo repartir tu presupuesto.",
        help: [
          "Definimos el mix de canales según tu embudo de ventas",
          "Probamos con presupuestos controlados antes de escalar",
          "Unificamos los resultados en un solo tablero",
        ],
      },
    ],
  },
];

/**
 * "Nuestros servicios": título centrado arriba y, por cada servicio, un
 * bloque en dos columnas al 50%. En escritorio, la izquierda (el servicio)
 * queda fija mientras a la derecha las cards de problemas se van apilando
 * una encima de la otra al scrollear (cada card es sticky con un offset un
 * poco mayor que la anterior). Cuando termina la última card, se sueltan
 * las dos columnas y sigue el scroll normal. En celular se apila todo, sin
 * sticky.
 */
export function ServicesStickySection({
  images = {},
}: {
  /** imágenes cargadas desde /admin/services, por slug */
  images?: Record<string, ServiceImage>;
}) {
  return (
    <section aria-labelledby="servicios-title" className="pt-24 pb-12">
      <div className="mx-auto max-w-[108rem] px-10">
        {/* El título queda fijo solo durante los primeros TITLE_STICKY_BLOCKS
            bloques: vive en este contenedor junto con ellos, y el sticky se
            suelta cuando el contenedor termina. */}
        <div>
          <h2
            id="servicios-title"
            // Sticky (debajo del header) mientras pasan los primeros bloques
            // de servicios. Fondo blanco a todo el ancho para que el
            // contenido pase por detrás.
            className="z-20 mb-4 bg-white/95 px-4 py-3 text-center font-heading text-[2.5rem] font-normal leading-tight tracking-tight text-[#4a4a4a] backdrop-blur lg:sticky lg:top-[var(--site-header-height,77px)] lg:ml-[calc(50%-50vw)] lg:w-screen"
          >
            Nuestros servicios{" "}
            <span className="font-extralight text-neutral-400">apoyados con IA</span>
          </h2>

          {SERVICES.slice(0, TITLE_STICKY_BLOCKS).map((service) => (
            <ServiceBlock
              key={service.id}
              service={service}
              image={images[service.id]}
              underTitle
            />
          ))}
        </div>

        {/* El resto de los servicios, ya sin el título fijo arriba */}
        {SERVICES.slice(TITLE_STICKY_BLOCKS).map((service) => (
          <ServiceBlock
            key={service.id}
            service={service}
            image={images[service.id]}
          />
        ))}
      </div>
    </section>
  );
}

// cantidad de bloques de servicio durante los que "Nuestros servicios"
// queda fijo arriba
const TITLE_STICKY_BLOCKS = 2;

// offset vertical de las cards apiladas: debajo del header (+ el título fijo
// en los bloques que lo tienen arriba) + un margen, y cada card un poco más
// abajo que la anterior para que se vea el "mazo"
const STACK_BASE_UNDER_TITLE = "var(--site-header-height,77px) + 7rem";
const STACK_BASE = "var(--site-header-height,77px) + 2.5rem";
const STACK_STEP_REM = 0.5;

// Por el momento los bloques muestran solo el anillo animado, sin imagen.
// Para volver a mostrar la imagen del admin (o la estatua de respaldo),
// cambiar a true.
const SHOW_SERVICE_IMAGES = false;

function ServiceBlock({
  service,
  image,
  underTitle = false,
}: {
  service: Service;
  image?: ServiceImage;
  /** true = el título "Nuestros servicios" está fijo arriba de este bloque */
  underTitle?: boolean;
}) {
  const stackBase = underTitle ? STACK_BASE_UNDER_TITLE : STACK_BASE;
  return (
    <div
      id={`servicio-${service.id}`}
      // En escritorio ocupa todo el ancho de la pantalla (rompe el contenedor
      // centrado) y se divide 45vw (servicio) / 55vw (cards), cada columna con
      // su propio padding lateral.
      className="grid gap-12 py-12 lg:ml-[calc(50%-50vw)] lg:w-screen lg:grid-cols-[45vw_55vw] lg:gap-0"
    >
      {/* Izquierda (fija mientras pasan las cards): arriba la imagen dentro
          del anillo animado, abajo un bloque de prompt como el del hero con
          una pregunta del servicio. En escritorio ocupa el alto de la
          pantalla: el prompt toma su alto y la imagen el resto. */}
      <div
        className={cn(
          "lg:sticky lg:flex lg:min-h-[36rem] lg:flex-col lg:self-start lg:pl-10 lg:pr-12 xl:pl-20",
          underTitle
            ? "lg:top-[calc(var(--site-header-height,77px)+7rem)] lg:h-[calc(100svh-var(--site-header-height,77px)-9.5rem)]"
            : "lg:top-[calc(var(--site-header-height,77px)+2.5rem)] lg:h-[calc(100svh-var(--site-header-height,77px)-5rem)]",
        )}
      >
        <div className="relative hidden min-h-[16rem] flex-1 lg:block">
          {/* Pill con el nombre del servicio, arriba a la izquierda */}
          <TagPill
            tone="category"
            variant="outline"
            color={service.color}
            className="absolute left-0 top-0 z-10 px-4 py-1 text-base"
          >
            {service.name}
          </TagPill>
          <HeroSolaris
            anchorX={0.5}
            anchorY={0.55}
            size={0.38}
            color={service.color}
            background={false}
            scrollExplode={false}
            fixedAnchor
          />
          {/* Imagen cargada en /admin/services (si viene con fondo blanco,
              CutoutImage se lo quita). Sin imagen cargada, la estatua del hero. */}
          {!SHOW_SERVICE_IMAGES ? null : image?.image_url ? (
            <CutoutImage
              src={image.image_url}
              alt={image.image_alt ?? service.name}
              className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[102%] w-[108%] -translate-x-1/2 -translate-y-1/2 select-none object-contain drop-shadow-[0_20px_40px_rgba(61,60,137,0.18)]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos
            <img
              src="/hero-estatua.webp"
              alt="Estatua romana sentada usando un smartphone y auriculares"
              width={656}
              height={1175}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute left-1/2 top-1/2 z-[5] h-[102%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none drop-shadow-[0_20px_40px_rgba(61,60,137,0.18)]"
            />
          )}
        </div>
        {/* En celular, solo el nombre del servicio */}
        <h3 className="font-heading text-4xl font-normal tracking-tight text-[#4a4a4a] lg:sr-only">
          {service.name}
        </h3>
        <HeroPromptBox
          className="relative z-10 mt-6 shrink-0 lg:mt-4"
          headingAs="h4"
          transparent
          questionClassName="font-bold"
          // misma referencia en todos los servicios → misma letra en todas
          // las preguntas, sin importar su largo
          fitReference="¿Qué querés medir mejor en tu negocio?"
          question={service.prompt.question}
          placeholder={service.prompt.placeholder}
          defaultServices={[service.prompt.service]}
        />
      </div>

      {/* Derecha: problemas del cliente, apilándose al scrollear */}
      <div className="flex flex-col gap-8 lg:gap-24 lg:pr-10 lg:pl-4 xl:pr-20">
        {service.issues.map((issue, i) => (
          <article
            key={issue.title}
            className="relative rounded-[28px] border border-neutral-200 bg-white p-8 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.12)] md:p-10 lg:sticky lg:min-h-[30rem]"
            style={{ top: `calc(${stackBase} + ${i * STACK_STEP_REM}rem)` }}
          >
            {/* Fila de arriba: "Problema NN" a la izquierda y la comilla
                decorativa a la derecha (en el color del servicio, muy
                clarito). Van en su propia fila para que la comilla nunca
                se superponga ni achique el título de abajo. */}
            <div className="flex items-start justify-between gap-4">
              <span
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: service.color }}
              >
                Problema {String(i + 1).padStart(2, "0")}
              </span>
              <QuoteMark
                color={service.color}
                className="pointer-events-none -mr-2 w-12 shrink-0 md:-mr-4 md:w-14"
              />
            </div>
            <h4 className="mt-3 font-heading text-[1.75rem] font-normal leading-[1.1] tracking-tight text-[#4a4a4a] md:text-[2rem]">
              {issue.title}
            </h4>
            <p className="mt-2 font-heading text-lg font-extralight leading-snug text-[#4a4a4a] md:text-xl">
              {issue.description}
            </p>
            <div className="mt-5 border-t border-neutral-200 pt-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#4a4a4a]">
                Cómo te ayudamos
              </p>
              <ul className="mt-4 space-y-3">
                {issue.help.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-[#4a4a4a]"
                  >
                    {/* tilde dentro de un círculo en el color del servicio */}
                    <span
                      aria-hidden
                      className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: service.color }}
                    >
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
        {/* Espacio extra al final: con la última card ya apilada, el mazo
            se queda quieto un momento antes de soltarse */}
        <div aria-hidden className="hidden h-[20svh] lg:block" />
      </div>
    </div>
  );
}

/** Comilla de cierre (”) en bloque, como ícono decorativo. */
function QuoteMark({ color, className }: { color: string; className?: string }) {
  const glyph =
    "M5 0H35a5 5 0 0 1 5 5V50C40 67 31 78 16 80a3 3 0 0 1-3.2-3V72.6a3 3 0 0 1 2.6-3C22.5 68.2 27 62.5 27 55V40H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z";
  return (
    <svg viewBox="0 0 96 80" aria-hidden className={className} fill={color} fillOpacity={0.09}>
      <path d={glyph} />
      <path d={glyph} transform="translate(56 0)" />
    </svg>
  );
}
