"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCardVertical } from "@/components/site/post-card-vertical";
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
            <TagPill
              tone="category"
              color={categoryColor}
              href={`/blog/categoria/${categorySlug}`}
              className="border-2 px-4 py-1 text-base font-bold"
            >
              {categoryName}
            </TagPill>
          </h2>
          <span className="mx-2 shrink-0 text-2xl font-thin text-gray-400">/</span>

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
                      className="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-400 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
                    >
                      {sub.name}
                    </TagPill>
                  ))}
                </div>
              )}
            </div>
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-l from-transparent to-white transition-opacity",
                canScrollSubcategoriesPrev ? "opacity-100" : "opacity-0"
              )}
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-white transition-opacity",
                canScrollSubcategoriesNext ? "opacity-100" : "opacity-0"
              )}
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <TagPill
              tone="category"
              color={categoryColor}
              href={`/blog/categoria/${categorySlug}`}
              className="border-2 px-4 py-1 text-base"
            >
              Ver todo
              <ArrowRightIcon className="size-3.5" />
            </TagPill>
            {hasOverflow && (
              <div className="flex items-center gap-2">
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

        <div className={CAROUSEL_DIVIDER_CLASS} />
      </div>

      {posts.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={CAROUSEL_SCROLL_ROW_CLASS}
        >
          {posts.map((post) => (
            <PostCardVertical
              key={post.id}
              post={post}
              categoryPillVariant="outline"
              categoryPillClassName="px-4 py-1 text-base"
              subcategoryPillClassName="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-400 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
              titleClassName="font-heading font-normal text-2xl lg:text-3xl"
              excerptClassName="text-lg"
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Próximamente</p>
      )}
    </section>
  );
}
