import { Suspense } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HeroSolaris } from "@/components/site/hero-solaris";
import { HeroPromptBox } from "@/components/site/hero-prompt-box";
import { ContactForm } from "@/components/site/contact-form";
import { HeroAurora } from "@/components/site/hero-aurora";
import { HeroLightTrails } from "@/components/site/hero-light-trails";
import {
  HeroGradientTest,
  HeroLinesTest,
  HeroStreaksTest,
  HeroWaveTest,
} from "@/components/site/hero-test-backgrounds";
import { TagPill } from "@/components/site/tag-pill";
import { ServicesStickySection } from "@/components/site/services-sticky-section";
import { HeroClientLogos } from "@/components/site/hero-client-logos";
import { getPublicClients } from "@/lib/queries/clients";
import { getPopularPosts } from "@/lib/queries/posts";
import { getPublicServiceImages } from "@/lib/queries/service-images";
import { getPublicServiceIssues } from "@/lib/queries/service-issues";
import { getPublicSuccessCases } from "@/lib/queries/success-cases";
import { SuccessCasesSection } from "@/components/site/success-cases-section";
import { PopularPostsCarousel } from "@/components/site/popular-posts-carousel";
import { getPublicSiteSettings } from "@/lib/queries/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  // PRUEBA: con /?hero=gradient el hero de escritorio usa el fondo de
  // degradé animado (HeroGradient) con textos en blanco. Sin el parámetro,
  // el hero queda como siempre.
  const heroParam = (await searchParams).hero;
  const gradientTest = heroParam === "gradient";
  // fondo anterior (manchas en movimiento) para comparar: /?hero=manchas
  const blobsTest = heroParam === "manchas";
  // fondo de líneas con curvas (prueba anterior): /?hero=lineas
  const linesTest = heroParam === "lineas";
  // estelas de luz (prueba anterior): /?hero=estelas
  const streaksTest = heroParam === "estelas";
  // cinta ondulada (prueba anterior): /?hero=onda
  const waveTest = heroParam === "onda";
  const [{ hero_pill_text, hero_title }, clients, popularPosts, serviceImages, successCases, serviceIssues] = await Promise.all([
    getPublicSiteSettings(),
    getPublicClients(),
    // Mismos "Más vistos" que la home del blog (posts marcados como populares)
    getPopularPosts([], 7).catch(() => []),
    getPublicServiceImages(),
    getPublicSuccessCases(),
    getPublicServiceIssues(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className={cn(
          "relative overflow-hidden bg-white text-neutral-950 h-[100svh] min-h-[600px] -mt-[var(--site-header-height,69px)] flex items-center lg:items-stretch",
          // prueba de fondo oscuro: título y pregunta en blanco (escritorio)
          gradientTest && "lg:[&_h1]:text-white lg:[&_h2]:text-white",
        )}
      >
        {gradientTest && <HeroGradientTest className="absolute inset-0 hidden lg:block" />}
        {/* Fondo: estelas horizontales de luz que corren hacia la derecha
            (transparente). Pruebas anteriores para comparar: /?hero=onda
            (cinta ondulada), /?hero=estelas (estelas de luz convergentes),
            /?hero=lineas (haces de líneas con curvas) y /?hero=manchas
            (manchas en movimiento). */}
        {blobsTest ? (
          // escritorio: manchas 1.5x más grandes y sin tocar el borde de abajo
          <HeroAurora
            className={cn(
              "absolute inset-0 h-full w-full lg:[--aurora-k:1.5]",
              gradientTest && "lg:hidden",
            )}
            desktopAvoidBottom
          />
        ) : linesTest ? (
          <HeroLinesTest className={cn("absolute inset-0 h-full w-full", gradientTest && "lg:hidden")} />
        ) : streaksTest ? (
          <HeroStreaksTest className={cn("absolute inset-0 h-full w-full", gradientTest && "lg:hidden")} />
        ) : waveTest ? (
          <HeroWaveTest className={cn("absolute inset-0 h-full w-full", gradientTest && "lg:hidden")} />
        ) : (
          <HeroLightTrails className={cn("absolute inset-0 h-full w-full", gradientTest && "lg:hidden")} />
        )}
        {/* Solo el anillo animado detrás de la estatua; las capas de fondo
            (aurora, halo, grilla, viñeta) quedan apagadas por ahora → hero en
            blanco. Para volver a activarlas, sacar background={false}. */}
        {/* En mobile el anillo va más abajo y más grande: pasa POR ENCIMA de la
            pregunta "¿Qué proyecto…?" y POR DEBAJO del recuadro del prompt
            (z-[6]; pill, título, prompt y logos van en z-[7]). */}
        <HeroSolaris
          // se ve al cargar: primer cuadro apenas está a la vista
          eager
          className="max-md:z-[6]"
          theme={gradientTest ? "dark" : "light"}
          anchorX={0.775}
          anchorY={0.55}
          background={false}
          mobileAnchorY={0.6}
          mobileSize={0.36}
        />
        {/* Estatua: en escritorio, centrada (horizontal y vertical) en la columna
            de la derecha: x = 77.5% (centro de la columna de 45vw), y = punto medio
            entre el borde inferior del header y el fondo del hero. */}
        {/* <picture>: la estatua solo se ve en escritorio. Un <img> con
            display:none igual se descarga (110 KB con prioridad alta), así
            que en mobile el <img> apunta a un GIF vacío y solo desde 1024px
            el <source> pide la estatua. */}
        <picture>
          {/* Se muestra a ~74% del alto del hero (proporción 656×1175 →
              ancho ≈ 74svh × 0.558): versiones redimensionadas por
              /_next/image en vez del original de 656px para todos. */}
          <source
            media="(min-width: 1024px)"
            srcSet={[320, 384, 448, 512, 576, 640, 750]
              .map((w) => `/_next/image?url=%2Fhero-estatua.webp&w=${w}&q=75 ${w}w`)
              .join(", ")}
            sizes="calc(74svh * 0.558)"
          />
          <img
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="Estatua romana sentada usando un smartphone y auriculares"
            width={656}
            height={1175}
            fetchPriority="high"
            className="pointer-events-none absolute left-[77.5%] top-[calc((var(--site-header-height,69px)+100%)/2)] z-[5] hidden h-[74%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none lg:block drop-shadow-[0_20px_40px_rgba(61,60,137,0.18)]"
          />
        </picture>
        {/* Hero en dos columnas en escritorio: izquierda 55vw (bloque de texto +
            prompt, centrado) y derecha 45vw (estatua + anillo Solaris, centrados
            en 55 + 45/2 = 77.5%). En escritorio el bloque gris ocupa todo el alto
            del hero: arranca debajo del header y termina a la misma distancia del
            fondo que la estatua (bottom-[4%] = max(4svh, 24px)), con el contenido
            centrado verticalmente adentro. */}
        <div className="relative z-10 max-md:z-auto w-full px-6 max-md:pt-[var(--site-header-height,72px)] md:px-10 lg:px-0 lg:pb-[max(4svh,24px)] lg:pt-[calc(var(--site-header-height,69px)+max(4svh,24px))]">
          <div className="flex justify-center lg:h-full lg:w-[55vw] lg:px-10">
            <div className="@container relative w-full max-w-2xl py-6 max-md:flex max-md:min-h-[calc(100svh-var(--site-header-height,72px))] max-md:flex-col max-md:items-center max-md:pb-[calc(max(1rem,env(safe-area-inset-bottom))+4.25rem)] max-md:pt-[clamp(1.5rem,5svh,3rem)] md:p-10 lg:flex lg:h-full lg:w-full lg:max-w-[52rem] lg:flex-col lg:[justify-content:safe_center] lg:*:shrink-0">
              {hero_pill_text && (
                // Pill sólida: fondo violeta de Crabsense y texto blanco.
                <TagPill
                  tone="category"
                  variant="solid"
                  color="#53539b"
                  className={cn("mb-4 border-2 border-[#53539b] px-3.5 py-1 text-sm font-bold max-md:relative max-md:z-[7] max-md:mb-[clamp(1.25rem,3.5svh,2.25rem)] sm:mb-5 sm:px-4 sm:py-1 sm:text-base")}
                >
                  {hero_pill_text}
                </TagPill>
              )}
              {hero_title && (
                // Desde md el tamaño es fluido (11.5cqw del bloque de texto) para que
                // el título entre siempre en 2 líneas: la línea más larga ("Crece con
                // tus datos") mide ~8.4em en Google Sans Flex con este tracking.
                <h1 className="mb-14 max-md:mb-[clamp(2.5rem,7svh,4.5rem)] text-balance font-heading max-md:relative max-md:z-[7] max-md:text-center text-[3.375rem] font-normal leading-[1.05] tracking-[-0.04em] text-[#4a4a4a] sm:text-[4.25rem] md:text-[11.5cqw]">
                  {hero_title}
                </h1>
              )}
              <HeroPromptBox headingAs={hero_title ? "h2" : "h1"} mobileHero minInputHeight={80} className="max-md:pt-4" />
              {/* mobile: los logos van al fondo del hero (mt-auto), justo
                  arriba del botón flotante "Contactar"; el resto del bloque
                  queda arriba */}
              <div className="relative z-[7] w-full max-md:mt-auto">
                <HeroClientLogos clients={clients} />
              </div>
            </div>
          </div>
        </div>
        {/* Línea divisoria fina al final del hero (100% del ancho) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-neutral-200"
        />
      </section>

      {/* Nuestros servicios: columna izquierda sticky + 4 tarjetas que pasan */}
      {/* Cada sección de abajo del hero va en su propio <Suspense>: React
          hidrata cada límite por separado y cediendo el hilo entre uno y
          otro, en vez de hidratar toda la home en una sola tarea larga
          (PageSpeed: Total Blocking Time). No cambia nada visualmente: el
          HTML llega completo del servidor igual que antes. */}
      <Suspense>
        <ServicesStickySection images={serviceImages} issues={serviceIssues} />
      </Suspense>

      {/* Casos de éxito (admin: /admin/casos): cards a todo el ancho */}
      <Suspense>
        <SuccessCasesSection cases={successCases} />
      </Suspense>

      {/* Más vistos: misma sección que la home del blog, con el mismo
          contenedor (max-w-[108rem] px-10) que usa el carrusel para
          alinear el título y las flechas */}
      {popularPosts.length > 0 && (
        <Suspense>
          <div className="max-w-[108rem] mx-auto px-6 md:px-10">
            <PopularPostsCarousel
              // sin el cuerpo de cada nota: las cards no lo usan y, como el
              // carrusel es un Client Component, viajaba entero en el HTML
              posts={popularPosts.map((p) => ({ ...p, content: "" }))}
              background={false}
              showPromo={false}
              title={
                // Mobile: mismo estilo que el título de "Casos de éxito":
                // "Blog" más marcado, una barra y "Más vistos" fino y en gris,
                // en una línea centrada.
                // Escritorio: "Blog / Artículos más vistos" como siempre.
                <span className="max-md:text-[2.125rem] max-md:leading-tight">
                  <Link
                    href="/blog"
                    className="font-medium text-[#4a4a4a] underline-offset-8 transition-colors hover:underline md:font-normal md:text-[#535396] md:hover:text-[#3d3c89]"
                  >
                    Blog
                  </Link>
                  <span className="mx-2 font-extralight text-neutral-300 md:mx-3 md:font-normal" aria-hidden>
                    /
                  </span>
                  {/* escritorio: mismo gris que el titular del hero */}
                  <span className="font-extralight text-[#8a8a8a] md:font-normal md:text-[#4a4a4a]">
                    <span className="hidden md:inline">Artículos más vistos</span>
                    <span className="md:hidden">Más vistos</span>
                  </span>
                </span>
              }
              action={
                <TagPill
                  href="/blog"
                  tone="category"
                  variant="outline"
                  color="#535396"
                  className="px-4 py-1 text-base"
                >
                  Ver más artículos
                </TagPill>
              }
            />
          </div>
        </Suspense>
      )}

      {/* CTA final: fondo gris claro, formulario de contacto (se guarda en leads) y,
          bien grande por detrás del formulario, el anillo animado de
          colores del hero. */}
      <Suspense>
        <section
          id="contacto"
          // ancla del botón "Contactar" del header
          className="relative scroll-mt-[var(--site-header-height,77px)] overflow-hidden bg-neutral-100 py-32 text-[#4a4a4a] md:py-44"
        >
          <HeroSolaris
            anchorX={0.5}
            anchorY={0.5}
            size={0.38}
            background={false}
            scrollExplode={false}
            fixedAnchor
            // mobile: un poco más arriba y más grande
            mobileAnchorY={0.42}
            mobileSize={0.46}
          />
          <div className="relative z-10 mx-auto max-w-[108rem] px-6 md:px-10">
            <h2 className="mb-5 text-center font-heading text-4xl leading-tight tracking-tight md:mb-10 md:text-[3.5rem]">
              ¿Listo para transformar tu negocio?
            </h2>
            <ContactForm className="mx-auto max-w-3xl" />
          </div>
        </section>
      </Suspense>
    </main>
  );
}
