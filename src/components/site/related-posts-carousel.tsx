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
          {hasOverflow && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-16 rounded-full disabled:opacity-20"
                disabled={!canScrollPrev}
                onClick={() => scrollBy(-1)}
              >
                <ChevronLeftIcon className="size-7" strokeWidth={1.5} />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-16 rounded-full disabled:opacity-20"
                disabled={!canScrollNext}
                onClick={() => scrollBy(1)}
              >
                <ChevronRightIcon className="size-7" strokeWidth={1.5} />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} onScroll={updateScrollState} className={CAROUSEL_SCROLL_ROW_CLASS}>
        {posts.map((post) => (
          <PostCardVertical
            key={post.id}
            post={post}
            categoryPillVariant="outline"
            categoryPillClassName="px-4 py-1 text-base"
            subcategoryPillClassName="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-500 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
            titleClassName="font-heading font-normal text-2xl lg:text-3xl"
            excerptClassName="text-lg"
          />
        ))}
      </div>
    </section>
  );
}
