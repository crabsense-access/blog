"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCardVertical } from "@/components/site/post-card-vertical";
import { CategoryPillCircleFill } from "@/components/site/category-pill-circle-fill";
import { TagPill } from "@/components/site/tag-pill";
import {
  CAROUSEL_DIVIDER_CLASS,
  CAROUSEL_HEADER_WRAPPER_CLASS,
  CAROUSEL_SCROLL_ROW_CLASS,
  CAROUSEL_SECTION_CLASS,
  CAROUSEL_TITLE_INDENT_CLASS,
} from "@/lib/carousel-layout";
import { cn } from "@/lib/utils";
import type { PostWithRelations, Subcategory } from "@/lib/types";

interface CategoryCarouselRowProps {
  categoryName: string;
  categorySlug: string;
  categoryColor?: string | null;
  posts: PostWithRelations[];
  subcategories: Subcategory[];
  className?: string;
}

const SCROLL_AMOUNT = 600;

// Velocidad del auto-scroll de subcategorías mientras el mouse queda sobre
// una flecha (mismo valor que post-categories-sticky-nav.tsx).
const SUBCATEGORY_AUTO_SCROLL_SPEED_PX = 6;

export function CategoryCarouselRow({
  categoryName,
  categorySlug,
  categoryColor,
  posts,
  subcategories,
  className,
}: CategoryCarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(posts.length > 0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const subcategoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollSubcategoriesPrev, setCanScrollSubcategoriesPrev] = useState(false);
  const [canScrollSubcategoriesNext, setCanScrollSubcategoriesNext] = useState(
    subcategories.length > 0
  );

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 0);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    setHasOverflow(el.scrollWidth > el.clientWidth + 1);
  }

  function updateSubcategoryScrollState() {
    const el = subcategoryScrollRef.current;
    if (!el) return;
    setCanScrollSubcategoriesPrev(el.scrollLeft > 0);
    setCanScrollSubcategoriesNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  const subcategoryAutoScrollFrameRef = useRef<number | null>(null);

  function stopSubcategoryAutoScroll() {
    if (subcategoryAutoScrollFrameRef.current !== null) {
      cancelAnimationFrame(subcategoryAutoScrollFrameRef.current);
      subcategoryAutoScrollFrameRef.current = null;
    }
  }

  // Mientras el mouse se queda sobre una flecha, sigue empujando el scroll
  // hacia ese lado en cada frame -- mismo comportamiento que el menú sticky
  // de categorías (post-categories-sticky-nav.tsx) para su propio scroll de
  // subcategorías.
  function startSubcategoryAutoScroll(direction: 1 | -1) {
    stopSubcategoryAutoScroll();
    function step() {
      const el = subcategoryScrollRef.current;
      if (!el) {
        subcategoryAutoScrollFrameRef.current = null;
        return;
      }
      el.scrollLeft += direction * SUBCATEGORY_AUTO_SCROLL_SPEED_PX;
      subcategoryAutoScrollFrameRef.current = requestAnimationFrame(step);
    }
    subcategoryAutoScrollFrameRef.current = requestAnimationFrame(step);
  }

  useEffect(() => stopSubcategoryAutoScroll, []);

  function scrollBy(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  useEffect(() => {
    updateScrollState();
  }, [posts]);

  useEffect(() => {
    updateSubcategoryScrollState();
  }, [subcategories]);

  return (
    <section className={cn(CAROUSEL_SECTION_CLASS, className)}>
      <div className={CAROUSEL_HEADER_WRAPPER_CLASS}>
        <div className="flex items-center gap-4">
          <h2 className={cn(CAROUSEL_TITLE_INDENT_CLASS, "shrink-0")}>
            <CategoryPillCircleFill
              color={categoryColor}
              href={`/blog/categoria/${categorySlug}`}
              className="px-4 py-1 text-base font-bold"
            >
              {categoryName}
            </CategoryPillCircleFill>
          </h2>
          <div className="relative min-w-0 flex-1">
            <div
              ref={subcategoryScrollRef}
              onScroll={updateSubcategoryScrollState}
              className="overflow-x-auto scrollbar-none"
            >
              {subcategories.length > 0 && (
                <div className="flex flex-nowrap items-center gap-1.5">
                  {subcategories.map((sub) => (
                    <TagPill
                      key={sub.id}
                      tone="subcategory"
                      href={`/blog/categoria/${categorySlug}/${sub.slug}`}
                      className="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-base font-medium text-gray-400 hover:border-gray-300 hover:bg-gray-300 hover:text-gray-700"
                    >
                      {sub.name}
                    </TagPill>
                  ))}
                </div>
              )}
            </div>
            {/* Flechas con auto-scroll en hover -- mismo patrón que el
                scroll de subcategorías del menú sticky
                (post-categories-sticky-nav.tsx): visibles (y clickeables,
                vía auto-scroll continuo) solo del lado en que todavía se
                puede scrollear. */}
            <div
              className={cn(
                "absolute inset-y-0 left-0 flex w-20 items-center justify-start bg-[linear-gradient(to_right,white_0%,white_45%,transparent_100%)] pl-2 transition-opacity",
                canScrollSubcategoriesPrev ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"
              )}
              onMouseEnter={() => canScrollSubcategoriesPrev && startSubcategoryAutoScroll(-1)}
              onMouseLeave={stopSubcategoryAutoScroll}
            >
              <ChevronLeftIcon className="size-4 text-gray-400" strokeWidth={2} />
            </div>
            <div
              className={cn(
                "absolute inset-y-0 right-0 flex w-20 items-center justify-end bg-[linear-gradient(to_left,white_0%,white_45%,transparent_100%)] pr-2 transition-opacity",
                canScrollSubcategoriesNext ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"
              )}
              onMouseEnter={() => canScrollSubcategoriesNext && startSubcategoryAutoScroll(1)}
              onMouseLeave={stopSubcategoryAutoScroll}
            >
              <ChevronRightIcon className="size-4 text-gray-400" strokeWidth={2} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <CategoryPillCircleFill
              color={categoryColor}
              href={`/blog/categoria/${categorySlug}`}
              className="px-4 py-1 text-base"
            >
              Ver todo
              <ArrowRightIcon className="size-3.5" />
            </CategoryPillCircleFill>
          </div>
        </div>

        <div className={CAROUSEL_DIVIDER_CLASS} />
      </div>

      {posts.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={CAROUSEL_SCROLL_ROW_CLASS}
        >
          {/* Flechas superpuestas sobre el borde de la primera/última
              imagen: mismo ancho/aspect-video que una card real (para que
              su alto coincida con el de la imagen), sticky left-0/right-0
              para quedar fijas en el borde visible al scrollear, con un
              margen negativo que cancela su propio ancho. */}
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
      ) : (
        <p className="text-muted-foreground">Próximamente</p>
      )}
    </section>
  );
}
