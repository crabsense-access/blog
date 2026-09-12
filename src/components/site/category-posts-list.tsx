"use client";

import { Fragment, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { MainBlockHorizontalItem } from "@/components/site/main-block-horizontal-item";
import type { PostWithRelations } from "@/lib/types";

const LOAD_MORE_COUNT = 5;

interface CategoryPostsListProps {
  initialPosts: PostWithRelations[];
  totalCount: number;
  // Server action (ya "bindeada" a la categoría/subcategoría correspondiente
  // por el componente padre) que trae la próxima tanda de posts.
  loadMore: (offset: number, limit: number) => Promise<PostWithRelations[]>;
}

/**
 * Listado de posts en formato horizontal (MainBlockHorizontalItem) con
 * "Ver más" que agrega de a 5 posts client-side, sin recargar la página.
 * Lo usan tanto la página de categoría como la de subcategoría.
 */
export function CategoryPostsList({ initialPosts, totalCount, loadMore }: CategoryPostsListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [isPending, startTransition] = useTransition();
  const hasMore = posts.length < totalCount;

  function handleLoadMore() {
    startTransition(async () => {
      const more = await loadMore(posts.length, LOAD_MORE_COUNT);
      setPosts((prev) => [...prev, ...more]);
    });
  }

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">Todavía no hay notas publicadas en esta categoría.</p>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Un único map para todos los items: mismo padding/margin de
          divisoria siempre, sin casos especiales. El primer item pierde el
          pt-2 que tiene por defecto, para que su imagen arranque
          exactamente en el mismo punto que la del bloque de categoría de
          la izquierda — es el único override, y no afecta el espaciado de
          las divisorias. */}
      {posts.map((post, index) => (
        <Fragment key={post.id}>
          {index > 0 && <div className="my-5 border-t border-gray-200" />}
          <MainBlockHorizontalItem
            post={post}
            className={index === 0 ? "pt-0" : undefined}
            titleClassName="min-h-20 text-3xl lg:text-4xl"
            authorNameClassName="text-base"
            metaClassName="text-sm"
          />
        </Fragment>
      ))}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "Cargando..." : "Ver más"}
          </Button>
        </div>
      )}
    </div>
  );
}
