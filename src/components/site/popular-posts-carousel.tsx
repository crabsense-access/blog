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
}

const SCROLL_AMOUNT = 600;
const PROMO_INSERT_INDEX = 2;

type CarouselItem =
  | { type: "post"; post: PostWithRelations }
  | { type: "promo" };

export function PopularPostsCarousel({ posts }: PopularPostsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(posts.length > 0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const items: CarouselItem[] = [
    ...posts.slice(0, PROMO_INSERT_INDEX).map((post) => ({ type: "post" as const, post })),
    { type: "promo" as const },
    ...posts.slice(PROMO_INSERT_INDEX).map((post) => ({ type: "post" as const, post })),
  ];

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
      <div className="absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-gray-50" />
      <div className={CAROUSEL_HEADER_WRAPPER_CLASS}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div />
          <h2 className="font-heading shrink-0 text-center text-[2.5rem] font-normal">
            Más vistos
          </h2>
          <div className="flex justify-end">
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
      </div>

      {items.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={CAROUSEL_SCROLL_ROW_CLASS}
        >
          {items.map((item) =>
            item.type === "promo" ? (
              <div key="promo" className="w-[calc((100%-3rem)/3.2)] shrink-0 snap-start">
                <InstagramPromoBlock />
              </div>
            ) : (
              <PostCardVertical
                key={item.post.id}
                post={item.post}
                categoryPillVariant="outline"
                categoryPillClassName="px-4 py-1 text-base"
                subcategoryPillClassName="border-2 border-gray-200 bg-gray-200 px-4 py-1 text-[15px] font-normal text-gray-400 hover:border-gray-300 hover:bg-gray-300 hover:text-gray-600"
                titleClassName="font-heading font-normal text-2xl lg:text-3xl"
                excerptClassName="text-lg"
              />
            )
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Próximamente</p>
      )}
    </section>
  );
}
