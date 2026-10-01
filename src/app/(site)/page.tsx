import Link from "next/link";
import { HeroSolaris } from "@/components/site/hero-solaris";
import { HeroPromptBox } from "@/components/site/hero-prompt-box";
import { HeroAurora } from "@/components/site/hero-aurora";
import { TagPill } from "@/components/site/tag-pill";
import { ServicesStickySection } from "@/components/site/services-sticky-section";
import { HeroClientLogos } from "@/components/site/hero-client-logos";
import { getPublicClients } from "@/lib/queries/clients";
import { getPopularPosts } from "@/lib/queries/posts";
import { getPublicServiceImages } from "@/lib/queries/service-images";
import { getPublicSuccessCases } from "@/lib/queries/success-cases";
import { SuccessCasesSection } from "@/components/site/success-cases-section";
import { PopularPostsCarousel } from "@/components/site/popular-posts-carousel";
import { getPublicSiteSettings } from "@/lib/queries/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ hero_pill_text, hero_title }, clients, popularPosts, serviceImages, successCases] = await Promise.all([
    getPublicSiteSettings(),
    getPublicClients(),
    // Mismos "Más vistos" que la home del blog (posts marcados como populares)
    getPopularPosts([], 7).catch(() => []),
    getPublicServiceImages(),
    getPublicSuccessCases(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white text-neutral-950 h-[100svh] min-h-[600px] -mt-[var(--site-header-height,69px)] flex items-center lg:items-stretch">
        {/* Manchas difuminadas (colores oscuros del logo) que se mueven al
            azar por el 100% del hero. */}
        <HeroAurora className="absolute inset-0 h-full w-full" />
        {/* Solo el anillo animado detrás de la estatua; las capas de fondo
            (aurora, halo, grilla, viñeta) quedan apagadas por ahora → hero en
            blanco. Para volver a activarlas, sacar background={false}. */}
        <HeroSolaris anchorX={0.775} anchorY={0.55} background={false} />
        {/* Estatua: en escritorio, centrada (horizontal y vertical) en la columna
            de la derecha: x = 77.5% (centro de la columna de 45vw), y = punto medio
            entre el borde inferior del header y el fondo del hero. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos */}
        <img
          src="/hero-estatua.webp"
          alt="Estatua romana sentada usando un smartphone y auriculares"
          width={656}
          height={1175}
          fetchPriority="high"
          className="pointer-events-none absolute left-[77.5%] top-[calc((var(--site-header-height,69px)+100%)/2)] z-[5] hidden h-[74%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none lg:block drop-shadow-[0_20px_40px_rgba(61,60,137,0.18)]"
        />
        {/* Hero en dos columnas en escritorio: izquierda 55vw (bloque de texto +
            prompt, centrado) y derecha 45vw (estatua + anillo Solaris, centrados
            en 55 + 45/2 = 77.5%). En escritorio el bloque gris ocupa todo el alto
            del hero: arranca debajo del header y termina a la misma distancia del
            fondo que la estatua (bottom-[4%] = max(4svh, 24px)), con el contenido
            centrado verticalmente adentro. */}
        <div className="relative z-10 w-full px-10 lg:px-0 lg:pb-[max(4svh,24px)] lg:pt-[calc(var(--site-header-height,69px)+max(4svh,24px))]">
          <div className="flex justify-center lg:h-full lg:w-[55vw] lg:px-10">
            <div className="relative w-full max-w-2xl p-6 md:p-10 lg:flex lg:h-full lg:w-full lg:max-w-[52rem] lg:flex-col lg:[justify-content:safe_center] lg:*:shrink-0">
              {hero_pill_text && (
                // Mismo estilo que las pills de categoría del blog (outline +
                // relleno deslizante en hover), en el violeta de la marca.
                <TagPill
                  tone="category"
                  variant="outline"
                  color="#535396"
                  className="mb-5 px-4 py-1 text-base"
                >
                  {hero_pill_text}
                </TagPill>
              )}
              {hero_title && (
                <h1 className="mb-14 text-balance font-heading text-6xl font-normal leading-[1.05] tracking-[-0.04em] text-[#4a4a4a] md:text-7xl">
                  {hero_title}
                </h1>
              )}
              <HeroPromptBox headingAs={hero_title ? "h2" : "h1"} />
              <HeroClientLogos clients={clients} />
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
      <ServicesStickySection images={serviceImages} />

      {/* Casos de éxito (admin: /admin/casos): cards a todo el ancho */}
      <SuccessCasesSection cases={successCases} />

      {/* Más vistos: misma sección que la home del blog, con el mismo
          contenedor (max-w-[108rem] px-10) que usa el carrusel para
          alinear el título y las flechas */}
      {popularPosts.length > 0 && (
        <div className="max-w-[108rem] mx-auto px-10">
          <PopularPostsCarousel
            posts={popularPosts}
            background={false}
            showPromo={false}
            title={
              <>
                <Link
                  href="/blog"
                  className="text-[#535396] underline-offset-8 transition-colors hover:text-[#3d3c89] hover:underline"
                >
                  Blog
                </Link>
                <span className="mx-3 text-neutral-300" aria-hidden>
                  /
                </span>
                {/* mismo gris que el titular del hero */}
                <span className="text-[#4a4a4a]">Artículos más vistos</span>
              </>
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
      )}

      {/* CTA final: fondo gris claro, el prompt del hero para que nos
          contacten y, bien grande por detrás del prompt, el anillo animado de
          colores del hero. */}
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
        />
        <div className="relative z-10 mx-auto max-w-[108rem] px-10">
          <h2 className="mb-10 text-center font-heading text-4xl leading-tight tracking-tight md:text-[3.5rem]">
            ¿Listo para transformar tu negocio?
          </h2>
          <HeroPromptBox
            headingAs="h3"
            showQuestion={false}
            minInputHeight={140}
            className="mx-auto max-w-2xl"
          />
        </div>
      </section>
    </main>
  );
}
