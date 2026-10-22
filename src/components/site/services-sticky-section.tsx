import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { CutoutImage } from "@/components/site/cutout-image";
import { FadingStickyTitle } from "@/components/site/fading-sticky-title";
import { HeroPromptBox } from "@/components/site/hero-prompt-box";
import { HeroAurora } from "@/components/site/hero-aurora";
import { HeroSolaris } from "@/components/site/hero-solaris";
import { StackShade } from "@/components/site/stack-shade";
import { TagPill } from "@/components/site/tag-pill";
import type { LeadService } from "@/lib/validations/lead";
import type { ServiceImage, ServiceIssue } from "@/lib/services";

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

// Contenido fijo de cada servicio. Los "issues" (problemas) se editan desde
// /admin/services (tabla service_issues); los de acá quedan como respaldo si
// la tabla no existe o un servicio no tiene problemas cargados.
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
  issues = {},
}: {
  /** imágenes cargadas desde /admin/services, por slug */
  images?: Record<string, ServiceImage>;
  /** problemas cargados desde /admin/services, por slug */
  issues?: Record<string, ServiceIssue[]>;
}) {
  // issues del admin si hay; si no, los del código
  const services = SERVICES.map((s) =>
    issues[s.id]?.length ? { ...s, issues: issues[s.id] } : s
  );
  return (
    <section
      id="servicios"
      aria-labelledby="servicios-title"
      // scroll-mt: el ancla "Servicios" del menú aterriza justo donde
      // arranca el sticky del título (título pegado debajo del header).
      // = alto del header - padding superior de la sección (pt-24 = 6rem).
      className="scroll-mt-[calc(var(--site-header-height,77px)-6rem)] pt-12 pb-2 md:pb-12 md:pt-24"
    >
      <div className="mx-auto max-w-[108rem] px-6 md:px-10">
        {/* El título queda fijo solo durante los primeros TITLE_STICKY_BLOCKS
            bloques: vive en este contenedor junto con ellos, y el sticky se
            suelta cuando el contenedor termina. */}
        <div>
          <FadingStickyTitle
            id="servicios-title"
            // se va junto con el último servicio cuando este empieza a irse
            followTargetId={`servicio-${SERVICES[SERVICES.length - 1].id}`}
            // Sticky (debajo del header) mientras pasan los primeros bloques
            // de servicios. Fondo blanco a todo el ancho para que el
            // contenido pase por detrás.
            className="z-20 mb-4 bg-white/95 px-4 py-3 text-center font-heading text-[2.125rem] font-normal md:text-[2.5rem] leading-tight tracking-tight text-[#4a4a4a] backdrop-blur lg:sticky lg:top-[var(--site-header-height,77px)] lg:ml-[calc(50%-50vw)] lg:w-screen"
          >
            Nuestros servicios{" "}
            <span className="font-extralight text-neutral-400">apoyados con IA</span>
          </FadingStickyTitle>

          {services.slice(0, TITLE_STICKY_BLOCKS).map((service) => (
            <ServiceBlock
              key={service.id}
              service={service}
              image={images[service.id]}
              underTitle
            />
          ))}
        </div>

        {/* El resto de los servicios, ya sin el título fijo arriba */}
        {services.slice(TITLE_STICKY_BLOCKS).map((service) => (
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
// queda fijo arriba: todos. Cuando el último empieza a irse, el título se
// va con él (FadingStickyTitle).
const TITLE_STICKY_BLOCKS = SERVICES.length;

// offset vertical de las cards apiladas: debajo del header (+ el título fijo
// en los bloques que lo tienen arriba) + un margen, y cada card un poco más
// abajo que la anterior para que se vea el "mazo"
const STACK_BASE_UNDER_TITLE = "var(--site-header-height,77px) + 7rem";
const STACK_BASE = "var(--site-header-height,77px) + 2.5rem";
const STACK_STEP_REM = 0.5;
// Servicios que en mobile muestran la imagen con el anillo debajo del texto
// alternativo (y ese texto más grande)
const WITH_MOBILE_IMAGE: string[] = ["analytics", "seo", "ads"];

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
  // Props del prompt del servicio (se usa en escritorio en la columna
  // izquierda y en mobile debajo de las cards)
  const promptProps = {
    headingAs: "h4" as const,
    transparent: true,
    questionClassName: "font-bold",
    // misma referencia en todos los servicios → misma letra en todas las
    // preguntas, sin importar su largo
    fitReference: "¿Qué querés medir mejor en tu negocio?",
    // en mobile, la pregunta más grande: 86% del recuadro. La de SEO es
    // más larga, así que queda en 74% para que entre en una línea.
    mobileFitRatio: service.id === "seo" ? 0.74 : 0.86,
    question: service.prompt.question,
    placeholder: service.prompt.placeholder,
    defaultServices: [service.prompt.service],
  };
  return (
    <div
      id={`servicio-${service.id}`}
      // En escritorio ocupa todo el ancho de la pantalla (rompe el contenedor
      // centrado) y se divide 45vw (servicio) / 55vw (cards), cada columna con
      // su propio padding lateral.
      className="grid pt-12 pb-4 lg:ml-[calc(50%-50vw)] lg:py-12 lg:w-screen lg:grid-cols-[45vw_55vw] lg:gap-0"
    >
      {/* Izquierda (fija mientras pasan las cards): arriba la imagen dentro
          del anillo animado, abajo un bloque de prompt como el del hero con
          una pregunta del servicio. En escritorio ocupa el alto de la
          pantalla: el prompt toma su alto y la imagen el resto. */}
      <div
        data-sticky-col
        className={cn(
          // mobile/tablet: "contents" → sus hijos pasan a ser items de la
          // grilla, así el prompt (order-2) puede ir debajo de las cards
          // (order-1)
          "max-lg:contents lg:sticky lg:flex lg:min-h-[36rem] lg:flex-col lg:self-start lg:pl-10 lg:pr-12 xl:pl-20",
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
              CutoutImage se lo quita). Apoyada en el borde inferior del
              área (no invade el espacio del prompt) y como máximo llega
              arriba hasta la altura de la pill del servicio.
              Sin imagen cargada, solo el anillo. */}
          {image?.image_url && (
            <CutoutImage
              src={image.image_url}
              alt={image.image_alt ?? service.name}
              className={cn(
                "pointer-events-none absolute bottom-0 left-1/2 z-[5] h-[90%] w-[110%] -translate-x-1/2 select-none object-contain object-bottom drop-shadow-[0_20px_40px_rgba(61,60,137,0.18)]",
                // Analytics (Coliseo): un poco más grande, creciendo desde la base
                service.id === "analytics" && "origin-bottom scale-[1.10]",
                // ADS (catapulta): un poco más grande, creciendo desde la base
                service.id === "ads" && "origin-bottom scale-[1.15]",
                // SEO & GEO: un poco más grande, creciendo desde la base
                service.id === "seo" && "origin-bottom scale-[1.15]",
              )}
            />
          )}
        </div>
        {/* En celular, solo el nombre del servicio, como pill (mismo estilo
            que la pill de escritorio, en el color del servicio) */}
        <h3 className="lg:sr-only">
          <TagPill
            tone="category"
            variant="outline"
            color={service.color}
            className="px-4 py-1 text-base"
          >
            {service.name}
          </TagPill>
        </h3>
        {/* En celular, debajo de la pill: el texto alternativo de la imagen
            cargado en /admin/services */}
        {image?.image_alt && (
          <p
            className={cn(
              "mt-5 font-heading text-[1.75rem] font-normal leading-[1.1] tracking-tight text-[#5e5e5e] lg:hidden",
              // Analytics, SEO y ADS: texto más grande y aire con la imagen de abajo
              WITH_MOBILE_IMAGE.includes(service.id) && "pb-6 text-[2rem] leading-[1]",
            )}
          >
            {image.image_alt}
          </p>
        )}
        {/* En celular, en Analytics, SEO y ADS: la imagen con el anillo animado
            detrás, debajo del texto alternativo (en escritorio esto vive en
            la columna de arriba). alt vacío: el texto de arriba ya la
            describe. */}
        {WITH_MOBILE_IMAGE.includes(service.id) && image?.image_url && (
          // Alto con margen para que el anillo (y sus ondas) no se corte abajo
          <div className="relative mt-4 h-[22rem] lg:hidden">
            <HeroSolaris
              anchorX={0.5}
              anchorY={0.5}
              size={0.37}
              // SEO (celular): anillo un poco más grande y más arriba. El
              // lienzo se extiende 40px arriba y 32px abajo del contenedor
              // para que el anillo (con sus llamaradas) no se corte; el
              // centro queda a 158px del borde superior del contenedor.
              className={service.id === "seo" ? "max-md:-top-10 max-md:-bottom-8" : undefined}
              mobileSize={service.id === "seo" ? 0.42 : undefined}
              mobileAnchorY={service.id === "seo" ? 0.467 : undefined}
              color={service.color}
              background={false}
              scrollExplode={false}
              fixedAnchor
            />
            <CutoutImage
              src={image.image_url}
              alt=""
              className={cn(
                "pointer-events-none absolute bottom-[70px] left-1/2 z-[5] h-[82%] w-[110%] -translate-x-1/2 origin-bottom scale-[1.08] select-none object-contain object-bottom drop-shadow-[0_20px_40px_rgba(61,60,137,0.18)]",
                // SEO (celular): la imagen un poco más abajo
                service.id === "seo" && "max-md:bottom-[50px]",
              )}
            />
          </div>
        )}
        {/* Bloque del prompt (escritorio). En mobile se muestra debajo de
            las cards (ver más abajo). */}
        <div
          // Con imagen cargada, más aire entre la imagen y el prompt
          className={cn(
            "relative z-10 mt-6 shrink-0 max-lg:hidden",
            image?.image_url ? "lg:mt-6" : "lg:mt-4",
          )}
        >
          <HeroPromptBox {...promptProps} />
        </div>
      </div>

      {/* Derecha: problemas del cliente, apilándose al scrollear (también en
          mobile). En mobile, detrás de las cards y del prompt va el fondo
          difuminado del hero, a todo el ancho y desvanecido arriba y abajo
          (mask) para que no se note el corte del bloque. */}
      <div className="relative max-lg:mt-0 max-lg:pt-4 max-lg:pb-10 lg:pr-10 lg:pl-4 xl:pr-20">
        <HeroAurora className="absolute inset-y-0 -inset-x-6 md:-inset-x-10 lg:hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]" />
        {/* Las cards se apilan solo dentro de este contenedor: al terminar,
            se sueltan y no tapan el prompt de abajo */}
        <div className="flex flex-col gap-8 lg:gap-24">
        <StackShade />
        {service.issues.map((issue, i) => (
          <article
            key={issue.title}
            data-stack-card
            // sombra hacia arriba más marcada: la card que entra proyecta
            // sombra sobre la de atrás
            className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_-16px_40px_-12px_rgba(0,0,0,0.28)] md:p-10 sticky top-[var(--stack-top-sm)] lg:top-[var(--stack-top-lg)] lg:min-h-[30rem]"
            style={
              {
                // escritorio: debajo del header (y del título fijo)
                "--stack-top-lg": `calc(${stackBase} + ${i * STACK_STEP_REM}rem)`,
                // mobile: el header no queda fijo, así que se apilan desde
                // arriba de la pantalla, cada una un poco más abajo
                "--stack-top-sm": `calc(1rem + ${i * 0.75}rem)`,
              } as React.CSSProperties
            }
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
                className="pointer-events-none -mr-2 w-12 shrink-0 md:-mr-4 md:w-[4.5rem]"
              />
            </div>
            <h4 className="mt-3 font-heading text-[1.625rem] font-normal leading-[1.1] tracking-tight text-[#4a4a4a] md:text-[2rem]">
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
                    className="flex items-start gap-2.5 text-[15px] text-[#4a4a4a] md:text-base"
                  >
                    {/* tilde dentro de un círculo en el color del servicio */}
                    <span
                      aria-hidden
                      className="mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: service.color }}
                    >
                      <Check className="size-3 text-white" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Sombreado de la card de atrás: se oscurece desde abajo a
                medida que la siguiente se le apila encima (--cover, ver
                StackShade) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-t from-black/45 via-black/15 to-transparent"
              style={{ opacity: "var(--cover, 0)" }}
            />
          </article>
        ))}
        {/* Espacio extra al final: con la última card ya apilada, el mazo
            se queda quieto un momento antes de soltarse */}
        <div aria-hidden className="hidden h-[20svh] lg:block" />
        </div>
        {/* Mobile: el prompt va debajo de las cards, sobre el fondo
            difuminado (no es una card) y con el recuadro de texto en blanco */}
        <div className="relative mt-12 lg:hidden">
          <HeroPromptBox
            {...promptProps}
            transparent={false}
            // recuadro del prompt un poco más alto (solo mobile)
            minInputHeight={80}
          />
        </div>
      </div>
    </div>
  );
}

/** Comilla de cierre (”) en bloque, como ícono decorativo. */
function QuoteMark({ color, className }: { color: string; className?: string }) {
  const glyph =
    "M5 0H35a5 5 0 0 1 5 5V50C40 67 31 78 16 80a3 3 0 0 1-3.2-3V72.6a3 3 0 0 1 2.6-3C22.5 68.2 27 62.5 27 55V40H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5Z";
  return (
    <svg viewBox="0 0 96 80" aria-hidden className={className} fill={color} fillOpacity={0.2}>
      <path d={glyph} />
      <path d={glyph} transform="translate(56 0)" />
    </svg>
  );
}
