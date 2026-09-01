"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCardVertical } from "@/components/site/post-card-vertical";
import { cn } from "@/lib/utils";
import type { PostWithRelations, Subcategory } from "@/lib/types";

interface CategoryCarouselRowProps {
  categoryName: string;
  categorySlug: string;
  posts: PostWithRelations[];
  subcategories: Subcategory[];
}

const SCROLL_AMOUNT = 600;

export function CategoryCarouselRow({
  categoryName,
  categorySlug,
  posts,
  subcategories,
}: CategoryCarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(posts.length > 0);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 0);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  function scrollBy(direction: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  useEffect(() => {
    updateScrollState();
  }, [posts]);

  return (
    <section>
      <div className="mb-4 px-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="pl-2 text-2xl font-semibold uppercase">
            <Link
              href={`/blog/categoria/${categorySlug}`}
              className="transition-opacity hover:opacity-70"
            >
              {categoryName}
            </Link>
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={`/blog/categoria/${categorySlug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Ver todo →
            </Link>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                disabled={!canScrollPrev}
                onClick={() => scrollBy(-1)}
              >
                <ChevronLeftIcon className="size-4" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                disabled={!canScrollNext}
                onClick={() => scrollBy(1)}
              >
                <ChevronRightIcon className="size-4" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
          </div>
        </div>

        {subcategories.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 pl-2 text-sm text-muted-foreground">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/blog/categoria/${categorySlug}/${sub.slug}`}
                className="transition-colors hover:text-foreground hover:underline"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {posts.length > 0 ? (
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={cn(
            "flex snap-x snap-mandatory gap-8 overflow-x-auto pb-2 pr-0",
            "mr-[calc(50%-50vw)] scrollbar-none"
          )}
        >
          {posts.map((post) => (
            <PostCardVertical key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Próximamente</p>
      )}
    </section>
  );
}
