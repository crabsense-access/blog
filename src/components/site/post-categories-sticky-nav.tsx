"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ReadingProgressBar } from "@/components/site/reading-progress-bar";
import { TagPill } from "@/components/site/tag-pill";
import { cn } from "@/lib/utils";
import type { Category, Subcategory } from "@/lib/types";

interface CategoryWithSubcategories {
  category: Category;
  subcategories: Subcategory[];
}

interface PostCategoriesStickyNavProps {
  categories: CategoryWithSubcategories[];
  // Categoría del post que se está leyendo actualmente (post.category.id).
  // Determina qué pill principal arranca abierta (y a la que se vuelve al
  // sacar el mouse del menú) y el color de ReadingProgressBar — en vez de
  // siempre la primera categoría de la lista. Si no matchea ninguna
  // categoría de "categories" (o no se pasa), cae a la primera de la
  // lista, igual que el comportamiento previo.
  currentCategoryId?: string | null;
  // Barra de progreso de lectura pegada abajo del menú (ver
  // ReadingProgressBar). Tiene sentido en la página de un post (mide
  // cuánto falta de ESA nota), pero no en la home del blog, que no tiene
  // una sola nota que "leer" — ahí se pasa en false. Default: true, igual
  // que el comportamiento previo (antes de existir esta prop).
  showReadingProgress?: boolean;
  // Clases para un wrapper interno alrededor de las pills (el <ul>), sin
  // afectar el <nav> en sí (que sigue sin ancho propio: ver el comentario
  // dentro del return de abajo). Sirve para separar dos cosas que antes
  // vivían juntas: el ancho del FONDO/BORDE del <nav> (lo decide, como
  // siempre, el contenedor que envuelve a este componente en cada página)
  // del ancho del CONTENIDO (las pills) adentro de ese fondo. En la home,
  // el <nav> ahora ocupa el 100% de la pantalla (igual que <header>, que
  // tampoco tiene ancho propio) y este wrapper interno es el que centra y
  // acota las pills al ancho de contenido del sitio (mismo max-w-[108rem]
  // mx-auto px-10 que usa el contenido de <header>), para que ambas filas
  // queden alineadas. Default: undefined (sin wrapper propio) — mantiene
  // el comportamiento previo en la página de post, donde el ancho del
  // <nav> entero ya viene dado por el contenedor de esa página.
  contentClassName?: string;
  // Clases extra para el <nav> en sí (se agregan, no reemplazan, a las de
  // siempre). Se usa en la home para el truco de "full-bleed"
  // (w-screen ml-[calc(50%-50vw)]) que saca al <nav> del contenedor
  // centrado/paddeado de esa página -- aplicado ACÁ, directo sobre el
  // <nav>, y no en un <div> wrapper aparte alrededor de este componente,
  // a propósito: ese wrapper quedaría con una altura igual a la del
  // propio <nav> (nada más adentro), y position:sticky necesita que su
  // contenedor sea más alto que el elemento pegajoso para tener "margen"
  // donde quedarse pegado al scrollear -- el mismo bug que ya se había
  // encontrado y arreglado en la página de post (ver comentario en
  // blog/[slug]/page.tsx). Poniendo estas clases directo en el <nav>, su
  // padre real sigue siendo el contenedor alto de toda la página (home),
  // así el sticky tiene todo el margen que necesita. Default: undefined
  // (sin clases extra) — mantiene el comportamiento previo en la página
  // de post.
  className?: string;
}

// Debe coincidir con la duración de transición de .sticky-nav-pill-shift en
// globals.css: es tanto la duración del slide posicional como el tiempo que
// se espera, desde que arranca el hover, antes de recién ahí abrir el
// acordeón y mostrar las subcategorías (para que el slide termine primero).
const PILL_SHIFT_DURATION_MS = 350;

// Mismo espaciado que separa siempre a las pills principales entre sí (la
// clase "gap-3" del <ul> de más abajo = 0.75rem). Se usa para que, al
// terminar el slide, la pill hovereada quede separada de la anterior por
// el mismo padding de siempre, no pegada/superpuesta a ella.
const PILL_GAP_PX = 12;

// Velocidad (px por frame) del auto-scroll continuo al hacer hover sobre
// alguna de las flechas de los bordes del carrusel de subcategorías (ver
// CategoryAccordionItem más abajo) -- simula que el usuario sigue
// scrolleando manualmente hacia ese lado mientras el mouse se queda ahí.
const AUTO_SCROLL_SPEED_PX = 6;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Menú sticky de navegación por categorías para la página de post, pegado
 * justo debajo del header del sitio. Usa la variable --site-header-offset
 * (expuesta por site-header.tsx) para su "top": vale la altura del header
 * mientras este está visible (el menú queda pegado justo debajo), y pasa a
 * 0 en el mismo instante en que el header se esconde al scrollear hacia
 * abajo — así este menú sube y ocupa el lugar del header, sin dejar un
 * hueco en blanco arriba. La transición de "top" usa la misma duración y
 * curva que la del header (300ms ease-in-out) para que el borde de abajo
 * de este menú se mantenga pegado al borde de abajo del header durante
 * toda la animación, en vez de saltar de golpe a top:0 antes de que el
 * header termine de esconderse.
 *
 * Funciona como un "acordeón horizontal": las 4 categorías principales
 * están siempre visibles en una sola línea (nunca se ocultan ni se
 * reordenan), y las subcategorías de UNA sola categoría a la vez se
 * muestran a su lado, ocupando el espacio que va quedando libre en esa
 * línea — con scroll + fade en los bordes si no entran todas, igual que en
 * category-carousel-row.tsx.
 *
 * Al hacer hover sobre una categoría principal que NO sea la primera de la
 * lista, esa pill (solo ella, las demás quedan fijas en su lugar, incluida
 * la que estaba abierta hasta ahora — sigue abierta y ancha durante todo
 * este slide) se corre con un slide hacia la izquierda hasta quedar a la
 * misma distancia de siempre (el mismo gap que separa a cualquier par de
 * pills) del borde derecho de la PILL PRINCIPAL anterior — no de sus
 * subcategorías, aunque esa categoría anterior siga abierta durante el
 * slide. El destino se calcula midiendo solo esa pill anterior (nunca sus
 * subcategorías), así que da siempre un corrimiento chico y previsible,
 * sin importar cuán ancha esté la categoría que sigue abierta al lado.
 *
 * Recién cuando termina ese slide se cierra la categoría que estaba
 * abierta y se abre el acordeón de la nueva — ahí también se saca el
 * transform, porque en ese momento el propio layout flex (con la anterior
 * ya cerrada) deja a esta pill exactamente en el lugar al que apuntaba el
 * slide, así que mantener el transform pisaría esa posición correcta con
 * un corrimiento que ya no hace falta. Ese cierre de la categoría anterior
 * mueve el layout (offsetLeft) de esta pill en el mismo instante en que se
 * le saca el transform — sin cuidado especial, la transición CSS animaría
 * ese transform tomando como punto de partida un valor que ya no
 * corresponde al nuevo layout, y se vería la pill "volar" hasta el
 * principio del nav antes de corregirse. Por eso ese cambio puntual
 * (limpiar el transform justo cuando cambia el acordeón) se aplica sin
 * transición — instantáneo —, lo cual no se nota porque en ese preciso
 * momento la pill ya está exactamente en su posición final.
 *
 * La primera categoría DE LA LISTA (index 0, no necesariamente la que
 * arranca abierta) no tiene una "anterior" hacia la cual correrse, así
 * que si se le hace hover abre directo, sin slide posicional (y cierra
 * inmediatamente lo que estuviera abierto). Al pasar a otra categoría
 * principal se repite el efecto para la nueva.
 *
 * La categoría que arranca abierta (y a la que se vuelve al sacar el
 * mouse del menú) es la del post actual (currentCategoryId), no siempre
 * la primera de la lista — así el usuario ve de entrada, sin hacer
 * nada, en qué categoría está parado.
 *
 * Al sacar el mouse de todo el menú mientras una pill está a mitad de su
 * slide (todavía no abrió), ese slide se completa en reversa — la pill
 * vuelve corriéndose hacia la DERECHA hasta su lugar natural — y recién
 * cuando termina esa reversa se restaura la categoría por defecto (la
 * del post actual). Si en cambio ya no hay ningún slide pendiente
 * (todo asentado), la categoría por defecto se restaura directo, igual
 * que su propia apertura.
 *
 * Solo existe en desktop/tablet (md+): en mobile no hay espacio para un
 * acordeón horizontal de 4 categorías + subcategorías en una sola línea,
 * así que ahí no se renderiza nada.
 *
 * Incluye, pegada justo debajo (ver ReadingProgressBar), la línea de
 * progreso de lectura de la nota — salvo que se pase showReadingProgress
 * en false (así se usa en la home del blog, donde no hay una sola nota
 * cuyo progreso mostrar).
 */
export function PostCategoriesStickyNav({
  categories,
  currentCategoryId,
  showReadingProgress = true,
  contentClassName,
  className,
}: PostCategoriesStickyNavProps) {
  const currentCategory =
    categories.find(({ category }) => category.id === currentCategoryId)?.category ?? null;
  const defaultCategoryId = currentCategory?.id ?? categories[0]?.category.id ?? null;
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(defaultCategoryId);

  // Qué pill principal está corrida y cuántos px. Es null cuando nadie está
  // en posición corrida (todas en su lugar natural). Solo se mueve la pill
  // hovereada — las demás quedan fijas.
  const [shift, setShift] = useState<{ categoryId: string; deltaPx: number } | null>(null);

  // Id de la pill que en este preciso commit está terminando su slide y
  // abriendo su acordeón a la vez (shift se limpia y openCategoryId cambia
  // juntos). Mientras esto es así, esa pill puntual renderiza sin la clase
  // de transición: el cierre instantáneo de la categoría anterior ya la
  // deja en su posición final en ese mismo instante, así que no hace falta
  // (ni conviene) animar la remoción del transform — ver comentario más
  // arriba sobre por qué, sin esto, se veía "volar" hasta el principio.
  const [settlingCategoryId, setSettlingCategoryId] = useState<string | null>(null);

  // Refs de cada <li> completo (categoría + sus subcategorías si están
  // abiertas) — se usan para la posición REAL/actual de la pill hovereada
  // (que puede estar empujada a la derecha si la categoría anterior sigue
  // abierta en ese momento).
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  // Refs de la pill principal en sí (sin sus subcategorías) — se usan para
  // saber dónde termina específicamente la PILL de la categoría anterior,
  // sin contar el ancho de sus subcategorías si está abierta.
  const pillRefs = useRef(new Map<string, HTMLSpanElement>());
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
    };
  }, []);

  // Un frame después de marcar una pill como "settling" (ver arriba), ya se
  // pintó el commit instantáneo (sin transición) que la deja en su lugar
  // final — a partir de ahí se le puede devolver la clase de transición
  // para su PRÓXIMO hover, sin que este paso dispare ninguna animación (el
  // transform no cambia de valor al volver a agregar la clase).
  useEffect(() => {
    if (!settlingCategoryId) return;
    const id = requestAnimationFrame(() => setSettlingCategoryId(null));
    return () => cancelAnimationFrame(id);
  }, [settlingCategoryId]);

  if (categories.length === 0) return null;

  function clearPendingOpen() {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  }

  function handleHoverStart(categoryId: string, index: number) {
    clearPendingOpen();

    if (index === 0) {
      // La primera pill no tiene una "anterior" hacia la cual correrse:
      // abre directo, sin efecto de slide posicional.
      setShift(null);
      setOpenCategoryId(categoryId);
      return;
    }

    const currentEl = itemRefs.current.get(categoryId);
    const previousPillEl = pillRefs.current.get(categories[index - 1].category.id);

    if (currentEl && previousPillEl) {
      // previousPillEl es SOLO la pill principal anterior (nunca su
      // <li> completo ni sus subcategorías), así que este destino es
      // siempre chico y estable. currentEl.offsetLeft, en cambio, es la
      // posición REAL de esta pill ahora mismo — que puede estar bien
      // empujada a la derecha si la categoría anterior (u otra antes)
      // sigue abierta — y por eso el corrimiento (delta) puede ser
      // grande: no está "mal", es lo que hace falta para traer a ESTA
      // pill, y solo a ella, de vuelta junto a la anterior mientras todo
      // lo demás sigue exactamente donde está.
      const previousPillRight = previousPillEl.offsetLeft + previousPillEl.offsetWidth;
      const targetLeft = previousPillRight + PILL_GAP_PX;
      const deltaPx = targetLeft - currentEl.offsetLeft;
      setShift({ categoryId, deltaPx });
    }

    const delay = prefersReducedMotion() ? 0 : PILL_SHIFT_DURATION_MS;
    openTimeoutRef.current = setTimeout(() => {
      // settlingCategoryId + openCategoryId + shift cambian juntos, en el
      // mismo commit: ver el comentario de settlingCategoryId más arriba
      // sobre por qué este paso puntual no debe animarse.
      setSettlingCategoryId(categoryId);
      setOpenCategoryId(categoryId);
      setShift(null);
      openTimeoutRef.current = null;
    }, delay);
  }

  function handleLeaveNav() {
    clearPendingOpen();

    if (shift) {
      // Hay una pill a mitad de camino de su slide (todavía no abrió su
      // acordeón): la dejamos terminar de volver — con el mismo slide,
      // ahora en reversa hacia la derecha — a su lugar natural, y recién
      // cuando termina esa reversa restauramos la categoría por defecto.
      // Si hiciéramos ambas cosas a la vez, la categoría que sigue
      // abierta cerraría de golpe (sin animación) mientras esta pill
      // todavía se sigue deslizando, y se verían las dos cosas mezcladas.
      setShift(null);
      const delay = prefersReducedMotion() ? 0 : PILL_SHIFT_DURATION_MS;
      openTimeoutRef.current = setTimeout(() => {
        setOpenCategoryId(defaultCategoryId);
        openTimeoutRef.current = null;
      }, delay);
      return;
    }

    setOpenCategoryId(defaultCategoryId);
  }

  return (
    <nav
      aria-label="Categorías del blog"
      // Sin ancho propio por defecto: en la página de post, este <nav>
      // queda tan ancho como el contenedor que lo envuelve (ver
      // blog/[slug]/page.tsx, mismo ancho que el <article>) -- así el
      // fondo/borde queda alineado con el contenido, no pegado a los
      // 100vw de la pantalla. Si este <nav> pusiera ahí su propio px-10,
      // el padding solo empujaría el contenido hacia adentro sin
      // angostar el fondo/borde en sí (que seguiría pegado a los bordes
      // de la pantalla) -- por eso ese padding vive afuera, no acá.
      //
      // En la home, en cambio, se le pasa className con el truco de
      // "full-bleed" (ver blog/page.tsx) para que sí ocupe el 100% de la
      // pantalla, igual que <header> -- por eso className se agrega acá
      // (cn) en vez de vivir siempre afuera.
      className={cn(
        "sticky z-40 hidden border-b border-border bg-white transition-[top] duration-300 ease-in-out md:block",
        className
      )}
      style={{ top: "var(--site-header-offset, 4.5rem)" }}
      onMouseLeave={handleLeaveNav}
    >
      <ul className={cn("flex flex-nowrap items-center gap-3 py-5", contentClassName)}>
        {categories.map(({ category, subcategories }, index) => (
          <CategoryAccordionItem
            key={category.id}
            category={category}
            subcategories={subcategories}
            isOpen={openCategoryId === category.id}
            onHoverStart={() => handleHoverStart(category.id, index)}
            shiftPx={shift?.categoryId === category.id ? shift.deltaPx : 0}
            suppressShiftTransition={settlingCategoryId === category.id}
            registerRef={(el) => {
              if (el) itemRefs.current.set(category.id, el);
              else itemRefs.current.delete(category.id);
            }}
            registerPillRef={(el) => {
              if (el) pillRefs.current.set(category.id, el);
              else pillRefs.current.delete(category.id);
            }}
          />
        ))}
      </ul>
      {showReadingProgress && <ReadingProgressBar color={currentCategory?.pill_color} />}
    </nav>
  );
}

interface CategoryAccordionItemProps {
  category: Category;
  subcategories: Subcategory[];
  isOpen: boolean;
  onHoverStart: () => void;
  shiftPx: number;
  suppressShiftTransition: boolean;
  registerRef: (el: HTMLLIElement | null) => void;
  registerPillRef: (el: HTMLSpanElement | null) => void;
}

function CategoryAccordionItem({
  category,
  subcategories,
  isOpen,
  onHoverStart,
  shiftPx,
  suppressShiftTransition,
  registerRef,
  registerPillRef,
}: CategoryAccordionItemProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(subcategories.length > 0);
  // requestAnimationFrame en curso mientras el mouse está sobre alguna de
  // las flechas de los bordes (null = no hay ningún auto-scroll activo).
  const autoScrollFrameRef = useRef<number | null>(null);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 0);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  // Recalcula el estado del fade cada vez que este segmento se abre (el
  // ancho disponible recién se conoce una vez que el flex layout terminó de
  // acomodarse) o si cambia la lista de subcategorías.
  useEffect(() => {
    if (isOpen) updateScrollState();
  }, [isOpen, subcategories]);

  function stopAutoScroll() {
    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }

  // Mientras el mouse se queda sobre una flecha, sigue empujando el scroll
  // hacia ese lado en cada frame -- como si el usuario no soltara el touchpad
  // -- hasta que se va el mouse (stopAutoScroll) o el carrusel llega a la
  // punta (scrollLeft deja de moverse solo, el navegador lo clampea).
  function startAutoScroll(direction: 1 | -1) {
    stopAutoScroll();
    function step() {
      const el = scrollRef.current;
      if (!el) {
        autoScrollFrameRef.current = null;
        return;
      }
      el.scrollLeft += direction * AUTO_SCROLL_SPEED_PX;
      autoScrollFrameRef.current = requestAnimationFrame(step);
    }
    autoScrollFrameRef.current = requestAnimationFrame(step);
  }

  // Si este segmento se cierra (se pasa a otra categoría) con el mouse
  // todavía sobre una flecha, React desmonta este bloque sin disparar su
  // onMouseLeave -- sin este cleanup, el rAF quedaría corriendo de más.
  useEffect(() => stopAutoScroll, []);
  useEffect(() => {
    if (!isOpen) stopAutoScroll();
  }, [isOpen]);

  return (
    <li
      ref={registerRef}
      className={cn(
        "flex items-center gap-2",
        !suppressShiftTransition && "sticky-nav-pill-shift",
        isOpen ? "min-w-0 flex-1" : "shrink-0"
      )}
      style={{ transform: shiftPx ? `translateX(${shiftPx}px)` : undefined }}
      onMouseEnter={onHoverStart}
    >
      {/* Wrapper solo para poder medir el ancho de la pill principal en sí
          (sin contar las subcategorías, que son un hermano aparte dentro
          de este mismo <li>). Mismo tamaño que el resto de las pills
          "outline" de categoría del sitio (post cards, Bloque Principal,
          header del post): px-4 py-1 text-base. El efecto de relleno
          deslizante en hover vive en TagPill (tone="category"
          variant="outline"), así que convive sin problema con el slide
          posicional de este <li>. */}
      <span ref={registerPillRef} className="inline-flex shrink-0">
        <TagPill
          tone="category"
          variant="outline"
          color={category.pill_color}
          href={`/blog/categoria/${category.slug}`}
          className="px-4 py-1 text-base"
        >
          {category.name}
        </TagPill>
      </span>

      {isOpen && subcategories.length > 0 && (
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="pill-slide-up flex flex-nowrap items-center gap-1.5 overflow-x-auto scrollbar-none"
          >
            {subcategories.map((sub) => (
              <TagPill
                key={sub.id}
                tone="subcategory"
                href={`/blog/categoria/${category.slug}/${sub.slug}`}
                className="shrink-0 border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-500 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
              >
                {sub.name}
              </TagPill>
            ))}
          </div>
          {/* Difuse + flecha en cada borde: indican que hay más
              subcategorías para ese lado (scrolleable) y se ocultan apenas
              se llega al final de ese lado, igual que el fade solo. El
              degradé tiene 3 puntos (no 2): queda transparente pegado a las
              pills, pero ya llega a blanco SÓLIDO antes de la mitad del
              bloque — así la flecha queda siempre sobre blanco puro, sin
              que se alcance a ver ninguna letra de las pills por detrás. */}
          {/* pointer-events solo cuando el fade está visible (hay algo
              para ese lado): si no, esta franja de 80px quedaría bloqueando
              el click/hover de las pills reales que tiene debajo aunque no
              se vea nada ahí. Al entrar con el mouse arranca el auto-scroll
              continuo hacia ese lado (como si seguiera scrolleando a mano);
              al salir, se frena -- updateScrollState (ya wireado al
              onScroll de abajo) va togglear la flecha/opacity solo a
              medida que el auto-scroll avanza. */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 flex w-20 items-center justify-start bg-[linear-gradient(to_right,white_0%,white_45%,transparent_100%)] pl-2 transition-opacity",
              canScrollPrev ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"
            )}
            onMouseEnter={() => canScrollPrev && startAutoScroll(-1)}
            onMouseLeave={stopAutoScroll}
          >
            <ChevronLeftIcon className="size-4 text-gray-400" strokeWidth={2} />
          </div>
          <div
            className={cn(
              "absolute inset-y-0 right-0 flex w-20 items-center justify-end bg-[linear-gradient(to_left,white_0%,white_45%,transparent_100%)] pr-2 transition-opacity",
              canScrollNext ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"
            )}
            onMouseEnter={() => canScrollNext && startAutoScroll(1)}
            onMouseLeave={stopAutoScroll}
          >
            <ChevronRightIcon className="size-4 text-gray-400" strokeWidth={2} />
          </div>
        </div>
      )}
    </li>
  );
}
