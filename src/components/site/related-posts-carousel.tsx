"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCardVertical } from "@/components/site/post-card-vertical";
import {
  CAROUSEL_HEADER_WRAPPER_CLASS,
  CAROUSEL_SCROLL_ROW_CLASS,
  CAROUSEL_SECTION_CLASS,
  CAROUSEL_TITLE_INDENT_CLASS,
} from "@/lib/carousel-layout";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";

interface RelatedPostsCarouselProps {
  title: string;
  posts: PostWithRelations[];
  className?: string;
}

const SCROLL_AMOUNT = 600;

/**
 * Carrusel de "más artículos sobre" que se muestra al pie de la página de
 * un post, con las mismas cards (PostCardVertical) y el mismo
 * comportamiento de scroll/flechas que los carruseles de /blog
 * (CategoryCarouselRow, PopularPostsCarousel) — ver src/lib/carousel-layout.ts.
 */
export function RelatedPostsCarousel({ title, posts, className }: RelatedPostsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(posts.length > 0);
  const [hasOverflow, setHasOverflow] = useState(false);

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

  if (posts.length === 0) return null;

  return (
    <section className={cn(CAROUSEL_SECTION_CLASS, className)}>
      <div className={CAROUSEL_HEADER_WRAPPER_CLASS}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            className={cn(
              CAROUSEL_TITLE_INDENT_CLASS,
              "font-heading text-3xl font-normal lg:text-[2.5rem]"
            )}
          >
            {title}
          </h2>
        </div>
      </div>

      <div ref={scrollRef} onScroll={updateScrollState} className={CAROUSEL_SCROLL_ROW_CLASS}>
        {/* Flechas superpuestas sobre el borde de la primera/última imagen:
            viven DENTRO de la fila con scroll (mismo ancho/aspect-video que
            una card real, para que su alto coincida exacto con el de la
            imagen) pero con sticky left-0/right-0 para quedar fijas en el
            borde visible mientras se scrollea, y un margen negativo que
            cancela su propio ancho para no correr a las cards reales ni
            sumar scroll de más. */}
        {hasOverflow && (
          <div className="pointer-events-none sticky left-0 top-0 z-10 mr-[calc((100%-3rem)/-3.12)] flex aspect-video w-[calc((100%-3rem)/3.12)] shrink-0 self-start items-center">
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
        {posts.map((post) => (
          <PostCardVertical
            key={post.id}
            post={post}
            categoryPillVariant="outline"
            categoryPillClassName="px-4 py-1 text-base"
            subcategoryPillClassName="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-base font-medium text-gray-400 hover:border-gray-300 hover:bg-gray-300 hover:text-gray-700"
            titleClassName="font-heading font-normal text-2xl lg:text-3xl"
            excerptClassName="text-lg"
          />
        ))}
        {hasOverflow && (
          <div className="pointer-events-none sticky right-0 top-0 z-10 ml-[calc((100%-3rem)/-3.12)] flex aspect-video w-[calc((100%-3rem)/3.12)] shrink-0 self-start items-center justify-end">
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
    </section>
  );
}
