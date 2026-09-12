"use client";

import type { ReactNode } from "react";

import { FeaturedPostImage, FeaturedPostContent } from "@/components/site/featured-post-section";
import { RelatedPostsSidebar } from "@/components/site/related-posts-sidebar";
import { useFeaturedContentHeight } from "@/lib/use-featured-content-height";
import type { PostWithRelations } from "@/lib/types";

interface MainBlockFeaturedRowProps {
  featuredPost: PostWithRelations;
  relatedPosts: PostWithRelations[];
  activeSubcategorySlug?: string;
  showExcerpt?: boolean;
  showPromptDownload?: boolean;
  infoCard?: ReactNode;
  imageClassName?: string;
}

/**
 * Fila del Bloque Principal: imagen + contenido del destacado a la
 * izquierda, tarjeta de info opcional + item(s) horizontal(es)
 * (MainBlockHorizontalItem, vía RelatedPostsSidebar) a la derecha. Mide
 * dinámicamente el alto del contenido del destacado (título + excerpt +
 * autor/fecha) y lo aplica a los items horizontales, que quedan
 * orientados hacia abajo dentro de su columna.
 */
export function MainBlockFeaturedRow({
  featuredPost,
  relatedPosts,
  activeSubcategorySlug,
  showExcerpt = true,
  showPromptDownload = false,
  infoCard,
  imageClassName,
}: MainBlockFeaturedRowProps) {
  const { titleRef, authorRef, height } = useFeaturedContentHeight(featuredPost.id, showExcerpt);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-10">
      <div className="flex min-h-0 flex-col gap-4">
        <FeaturedPostImage post={featuredPost} className={imageClassName ?? "min-h-24 flex-1"} />
        <FeaturedPostContent
          post={featuredPost}
          activeSubcategorySlug={activeSubcategorySlug}
          titleRef={titleRef}
          authorRef={authorRef}
          className="h-auto shrink-0"
        />
      </div>
      <div className="flex min-h-0 flex-col gap-4">
        {infoCard}
        {relatedPosts.length > 0 && (
          <RelatedPostsSidebar
            relatedPosts={relatedPosts}
            itemHeight={height}
            showExcerpt={showExcerpt}
            showPromptDownload={showPromptDownload}
            activeSubcategorySlug={activeSubcategorySlug}
          />
        )}
      </div>
    </div>
  );
}
