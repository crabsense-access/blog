import { Fragment } from "react";

import { FeaturedPostImage, FeaturedPostContent } from "@/components/site/featured-post-section";
import { MainBlockHorizontalItem } from "@/components/site/main-block-horizontal-item";
import type { PostWithRelations } from "@/lib/types";

interface HomeFeaturedRowProps {
  featuredPost: PostWithRelations;
  relatedPosts: PostWithRelations[];
}

/**
 * Bloque Principal del home del blog: dos columnas de igual alto que
 * reparten el espacio disponible (flex-1 min-h-0). A la izquierda el post
 * destacado en formato vertical completo (imagen + contenido); a la
 * derecha los 2 items horizontales más recientes (MainBlockHorizontalItem,
 * flex-1 cada uno).
 */
export function HomeFeaturedRow({ featuredPost, relatedPosts }: HomeFeaturedRowProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col pb-16">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-x-10">
        <div className="flex h-full min-h-0 flex-col gap-4">
          <FeaturedPostImage post={featuredPost} className="min-h-24 flex-1" />
          <FeaturedPostContent
            post={featuredPost}
            className="h-auto shrink-0"
            titleClassName="text-[2.5rem]"
            excerptClassName="text-lg"
          />
        </div>

        <div className="flex h-full min-h-0 flex-col">
          {relatedPosts.map((post, index) => (
            <Fragment key={post.id}>
              {index > 0 && <div className="my-5 border-t border-gray-200" />}
              <MainBlockHorizontalItem post={post} flexShare />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
