import Link from "next/link";
import { ArrowUpRight } from "lucide-react";


import { successCaseService, type SuccessCase } from "@/lib/success-cases";

/**
 * "Casos de éxito" (home, debajo de "Nuestros servicios"): una card por
 * caso, a todo el ancho del contenedor del sitio, que se van apilando una
 * encima de la otra al scrollear (sticky).
 * Fondo: la imagen cargada en /admin/casos, desenfocada y con un velo negro
 * intenso para que el texto blanco se lea siempre. Si no hay casos
 * publicados, la sección no se muestra.
 */
export function SuccessCasesSection({ cases }: { cases: SuccessCase[] }) {
  if (cases.length === 0) return null;

  return (
    <section
      id="casos"
      aria-labelledby="casos-title"
      // scroll-mt: el ancla "Casos de éxito" del menú deja el título justo
      // debajo del header flotante
      className="scroll-mt-[var(--site-header-height,77px)] bg-gray-50 pb-16 pt-20 md:pb-24 md:pt-28"
    >
      <h2
        id="casos-title"
        className="mb-10 px-10 text-center font-heading text-[2.5rem] font-normal leading-tight tracking-tight text-[#4a4a4a]"
      >
        Casos de éxito{" "}
        <span className="font-extralight text-neutral-400">que hablan por nosotros</span>
      </h2>

      {/* Mismo contenedor y padding lateral que el resto del sitio. Las
          cards son sticky: al scrollear se van apilando una encima de la
          otra (cada una un poco más abajo que la anterior, como las cards de
          "Nuestros servicios"). */}
      <div className="mx-auto flex max-w-[108rem] flex-col gap-10 px-10">
        {cases.map((c, i) => (
          <div
            key={c.id}
            className="sticky"
            style={{ top: `calc(var(--site-header-height, 77px) + 1.5rem + ${i * 0.75}rem)` }}
          >
            <SuccessCaseCard item={c} />
          </div>
        ))}
        {/* Aire al final para que la última card llegue a apilarse */}
        <div aria-hidden className="h-[10svh]" />
      </div>
    </section>
  );
}

function SuccessCaseCard({ item }: { item: SuccessCase }) {
  const service = successCaseService(item.service);
  const external = !!item.link_url && !item.link_url.startsWith("/");

  const content = (
    <>
      {/* Fondo: imagen nítida + velo negro, con un degradé que se oscurece
          hacia abajo (donde va el texto) */}
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element -- imagen de Supabase Storage, el proyecto usa <img> plano
        <img
          src={item.image_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-black/20" />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/95 from-15% via-black/60 via-55% to-transparent"
      />

      <div className="relative flex w-full flex-col gap-8 px-8 py-10 md:flex-row md:items-end md:justify-between md:px-14 md:py-14">
        <div className="max-w-3xl">
          {/* Logo del cliente tal cual se subió en /admin/casos (imagen
              personalizada: conviene una versión clara/blanca con fondo
              transparente para que se lea sobre el fondo oscuro) */}
          {item.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element -- logo de Supabase Storage
            <img
              src={item.logo_url}
              alt={item.client_name}
              loading="lazy"
              decoding="async"
              className={`mb-6 h-12 w-auto max-w-64 object-contain object-left md:h-[4.5rem] md:max-w-80 ${
                // el logo de peiGo se subió en color: lo pasamos a blanco
                item.client_name?.toLowerCase().includes("peigo") ? "brightness-0 invert" : ""
              }`}
            />
          )}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {service && (
              // Misma forma que las pills del sitio (outline, borde 2px,
              // mayúsculas en negrita) pero siempre en blanco, sin cambio
              // en hover, para que se lea sobre el fondo oscuro.
              <span className="inline-flex w-fit items-center whitespace-nowrap rounded-full border-2 border-white bg-transparent px-4 py-1 text-base font-bold uppercase text-white">
                {service.name}
              </span>
            )}
            {item.client_name && (
              // nombre del cliente al lado de la pill, en mayúsculas
              <span className="text-base font-bold uppercase tracking-wide text-white">
                {item.client_name}
              </span>
            )}
          </div>
          <h3 className="font-heading text-4xl font-normal leading-[1.1] tracking-tight text-white md:text-5xl">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-4 max-w-3xl font-heading text-xl font-extralight leading-snug text-white/80 md:text-2xl">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-5 md:items-end md:text-right">
          {item.metric_value && (
            <div>
              <p className="font-heading text-6xl font-light leading-none tracking-tight text-white md:text-8xl">
                {item.metric_value}
              </p>
              {item.metric_label && (
                <p className="mt-3 max-w-sm text-lg font-bold uppercase tracking-wide text-white md:text-xl">
                  {item.metric_label}
                </p>
              )}
            </div>
          )}
          {item.link_url && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-[0.8rem] font-bold uppercase tracking-wide text-white transition-colors group-hover:bg-white group-hover:text-[#4a4a4a]">
              Ver caso
              <ArrowUpRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const className =
    "group relative flex min-h-[22rem] w-full flex-col justify-end overflow-hidden rounded-[28px] bg-neutral-900 shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.45)] md:min-h-[26rem]";

  if (!item.link_url) return <article className={className}>{content}</article>;
  if (external)
    return (
      <a href={item.link_url} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  return (
    <Link href={item.link_url} className={className}>
      {content}
    </Link>
  );
}
