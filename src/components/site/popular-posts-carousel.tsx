"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCardVertical } from "@/components/site/post-card-vertical";
import { InstagramPromoBlock } from "@/components/site/instagram-promo-block";
import {
  CAROUSEL_HEADER_WRAPPER_CLASS,
  CAROUSEL_SCROLL_ROW_CLASS,
  CAROUSEL_SECTION_CLASS,
} from "@/lib/carousel-layout";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";

interface PopularPostsCarouselProps {
  posts: PostWithRelations[];
  // Título de la sección. Por defecto "Más vistos" (home del blog); la home
  // del sitio pasa uno propio con link al blog.
  title?: React.ReactNode;
  // Elemento opcional alineado a la derecha, a la altura del título
  // (ej. una pill "Ver más artículos").
  action?: React.ReactNode;
  // false = sin el fondo gris a todo el ancho (ej. en la home del sitio)
  background?: boolean;
  // false = sin el bloque promocional de Instagram (solo artículos)
  showPromo?: boolean;
}

const SCROLL_AMOUNT = 600;

// Mobile (< 768px): sin flechas; cada artículo es una card (fondo blanco,
// borde y sombra) que ocupa casi todo el ancho y deja ver un poco la
// siguiente, para pasarlas deslizando de derecha a izquierda.
const MOBILE_CARD_CLASS =
  "max-md:w-[95%] max-md:rounded-3xl max-md:border max-md:border-neutral-200 max-md:bg-white max-md:p-4 max-md:shadow-[0_10px_30px_-12px_rgba(61,60,137,0.25)]";
const PROMO_INSERT_INDEX = 2;

type CarouselItem =
  | { type: "post"; post: PostWithRelations }
  | { type: "promo" };

export function PopularPostsCarousel({
  posts,
  title = "Más vistos",
  action,
  background = true,
  showPromo = true,
}: PopularPostsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(posts.length > 0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const items: CarouselItem[] = showPromo
    ? [
        ...posts.slice(0, PROMO_INSERT_INDEX).map((post) => ({ type: "post" as const, post })),
        { type: "promo" as const },
        ...posts.slice(PROMO_INSERT_INDEX).map((post) => ({ type: "post" as const, post })),
      ]
    : posts.map((post) => ({ type: "post" as const, post }));

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 0);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    setHasOverflow(el.scrollWidth > el.clientWidth + 1);
  }

  function scrollBy(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  useEffect(() => {
    updateScrollState();
  }, [posts]);

  return (
    <section className={cn(CAROUSEL_SECTION_CLASS, "relative z-0 pt-24 pb-24")}>
      {background && (
        <div className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-gray-50" />
      )}
      <div className={CAROUSEL_HEADER_WRAPPER_CLASS}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div />
          <h2 className="font-heading shrink-0 text-center text-[2.5rem] font-normal tracking-tight">
            {title}
          </h2>
          <div className="hidden justify-end md:flex">{action}</div>
        </div>
      </div>

      {items.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={cn(
            CAROUSEL_SCROLL_ROW_CLASS,
            // mobile: cards más juntas, con el mismo margen lateral que el
            // resto del sitio y aire arriba/abajo para que no se corte la sombra
            "max-md:gap-4 max-md:px-6 max-md:py-4 max-md:scroll-px-6",
          )}
        >
          {/* Flechas superpuestas sobre el borde de la primera/última
              imagen: mismo ancho/aspect-video que una card real (para que
              su alto coincida con el de la imagen), sticky left-0/right-0
              para quedar fijas en el borde visible al scrollear, con un
              margen negativo que cancela su propio ancho. */}
          {hasOverflow && (
            <div className="pointer-events-none sticky left-0 top-0 z-10 max-md:hidden mr-[calc((100%-3rem)/-3.12)] flex aspect-video w-[calc((100%-3rem)/3.12)] shrink-0 self-start items-center">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="pointer-events-auto size-20 -translate-x-1/2 rounded-full disabled:opacity-20"
                disabled={!canScrollPrev}
                onClick={() => scrollBy(-1)}
              >
                <ChevronLeftIcon className="size-7" strokeWidth={1.5} />
                <span className="sr-only">Anterior</span>
              </Button>
            </div>
          )}
          {items.map((item) =>
            item.type === "promo" ? (
              <div key="promo" className="w-[calc((100%-3rem)/3.12)] shrink-0 snap-start max-md:w-[95%]">
                <InstagramPromoBlock />
              </div>
            ) : (
              <PostCardVertical
                key={item.post.id}
                post={item.post}
                categoryPillVariant="outline"
                categoryPillClassName="px-4 py-1 text-base max-md:px-3 max-md:py-0.5 max-md:text-sm"
                subcategoryPillClassName="border-2 border-gray-200 bg-transparent px-4 py-1 text-base max-md:px-3 max-md:py-0.5 max-md:text-sm font-medium text-[#828a97] hover:border-gray-300 hover:bg-gray-300 hover:text-gray-700"
                titleClassName="font-heading font-normal text-2xl max-md:text-[1.625rem] lg:text-3xl"
                excerptClassName="text-lg"
                authorNameClassName="max-md:text-sm"
                authorTitleClassName="max-md:text-xs"
                // mobile: la fecha arriba y el autor debajo
                footerClassName="max-md:flex-col-reverse max-md:items-start"
                dateClassName="max-md:self-end max-md:pb-2"
                className={MOBILE_CARD_CLASS}
              />
            )
          )}
          {hasOverflow && (
            <div className="pointer-events-none sticky right-0 top-0 z-10 max-md:hidden ml-[calc((100%-3rem)/-3.12)] flex aspect-video w-[calc((100%-3rem)/3.12)] shrink-0 self-start items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="pointer-events-auto size-20 translate-x-1/2 rounded-full disabled:opacity-20"
                disabled={!canScrollNext}
                onClick={() => scrollBy(1)}
              >
                <ChevronRightIcon className="size-7" strokeWidth={1.5} />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Próximamente</p>
      )}
    </section>
  );
}
