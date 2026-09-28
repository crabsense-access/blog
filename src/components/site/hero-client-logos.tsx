import { PLACEHOLDER_LOGOS } from "@/lib/placeholder-logos";
import type { Client } from "@/lib/types";

interface LogoEntry {
  key: string;
  name: string;
  url: string | null;
  node: React.ReactNode;
}

/**
 * Carrusel de logos del hero (debajo del prompt): una fila que corre sola en
 * loop (CSS puro, mismo marquee que el carrusel del blog), con los extremos
 * difuminados. Los logos van en gris y al hacer hover recuperan su color
 * original y muestran un tooltip con el nombre del cliente. El carrusel se
 * pausa mientras el mouse está encima para que se pueda leer/clickear.
 * Se alimenta de /admin/clients (tabla client_logos); sin clientes cargados
 * muestra los logos placeholder.
 */
export function HeroClientLogos({ clients = [] }: { clients?: Client[] }) {
  const items: LogoEntry[] =
    clients.length > 0
      ? clients.map((c) => ({
          key: c.id,
          name: c.name,
          url: c.website_url,
          node: (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.logo_url}
              alt={c.name}
              // Sin lazy-loading a propósito: los logos que están fuera de la
              // vista (a la derecha del track) cargaban recién al acercarse y
              // pasaban de 0px a su ancho real → el track cambiaba de ancho en
              // plena animación y el loop pegaba un salto (parpadeo).
              decoding="async"
              // alto fijo de 40px para todos; el ancho es libre (sale de la
              // proporción de cada logo), así los logotipos alargados no se
              // achican para entrar en un tope de ancho
              className="h-10 w-auto max-w-none"
            />
          ),
        }))
      : PLACEHOLDER_LOGOS.map((l) => ({
          key: `placeholder-${l.id}`,
          name: l.name,
          url: null,
          node: <span className="text-neutral-900 [&_svg]:h-10">{l.node}</span>,
        }));

  if (items.length === 0) return null;

  // Con pocos logos se repite el set hasta tener al menos MIN_ITEMS, para que
  // un set siempre sea más ancho que el carrusel (hasta ~55vw en pantallas
  // grandes). Si no, al recorrer el loop queda un hueco vacío al final.
  const MIN_ITEMS = 16;
  const reps = Math.max(1, Math.ceil(MIN_ITEMS / items.length));
  const set = Array.from({ length: reps }, () => items).flat();
  // Duración proporcional a la cantidad de logos → velocidad constante
  // (~2.8s por logo) sin importar cuántos clientes haya cargados.
  const duration = `${set.length * 2.8}s`;

  return (
    <div
      aria-label="Empresas que confían en nosotros"
      // En escritorio rompe el padding del bloque y ocupa todo el ancho de la
      // columna izquierda del hero (55vw), centrado respecto del bloque.
      className="marquee-row marquee-fade group/marquee mt-4 pt-10 pb-2 lg:ml-[calc(50%-27.5vw)] lg:w-[55vw]! lg:max-w-none"
    >
      {/* más rápido que el carrusel del blog (48s por vuelta): ~2.8s por logo */}
      <div
        className="marquee-track group-hover/marquee:[animation-play-state:paused]"
        // will-change + backface: el track va en su propia capa de GPU, así el
        // filtro/máscara de los logos no fuerza repintados que titilan
        style={{ animationDuration: duration, willChange: "transform", backfaceVisibility: "hidden" }}
      >
        {[...set, ...set].map((item, i) => {
          // el segundo set es solo para el loop visual: oculto para lectores
          // de pantalla y fuera del orden de tabulación
          const clone = i >= set.length;
          const logo = (
            // brightness(0) lleva cada píxel visible a negro puro y la opacidad lo
            // convierte en un único gris (#cccccc sobre blanco), igual para todos
            // los logos sin importar sus colores originales. En hover vuelve
            // al color original. Requiere logos con fondo transparente.
            <span className="block brightness-0 opacity-20 transition duration-300 group-hover/logo:brightness-100 group-hover/logo:opacity-100 group-focus-visible/logo:brightness-100 group-focus-visible/logo:opacity-100">
              {item.node}
            </span>
          );
          return (
            <div
              key={`${item.key}-${i}`}
              aria-hidden={clone || undefined}
              className="group/logo relative flex shrink-0 items-center justify-center px-8"
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={clone ? -1 : undefined}
                  aria-label={item.name}
                  className="group/logo rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#535396]/40"
                >
                  {logo}
                </a>
              ) : (
                logo
              )}
              {/* tooltip con el nombre del cliente */}
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-md transition duration-200 group-hover/logo:translate-y-0 group-hover/logo:opacity-100"
              >
                {item.name}
                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
