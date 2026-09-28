import Link from "next/link";
import type { Ref } from "react";

import { PostImage } from "@/components/site/post-image";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { TagPill } from "@/components/site/tag-pill";
import { orderSubcategoriesForDisplay } from "@/lib/subcategory-order";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";

interface FeaturedPostSectionProps {
  post: PostWithRelations;
  className?: string;
  showExcerpt?: boolean;
  activeSubcategorySlug?: string;
  titleRef?: Ref<HTMLAnchorElement>;
  authorRef?: Ref<HTMLDivElement>;
  titleClassName?: string;
  excerptClassName?: string;
}

export function FeaturedPostImage({ post, className }: FeaturedPostSectionProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      // La imagen también lleva al post. Sale del orden de tabulación y de los
      // lectores de pantalla porque el título ya es el link principal.
      tabIndex={-1}
      aria-hidden
      className="block h-full w-full"
    >
      <PostImage
        src={post.cover_image_url}
        alt={post.title}
        className={cn("aspect-[2/1] h-full w-full overflow-hidden rounded", className)}
      />
    </Link>
  );
}

export function FeaturedPostContent({
  post,
  className,
  showExcerpt = true,
  activeSubcategorySlug,
  titleRef,
  authorRef,
  titleClassName,
  excerptClassName,
}: FeaturedPostSectionProps) {
  const category = post.category;
  const authorLabel = post.author?.full_name || post.author?.email;
  const orderedSubcategories = orderSubcategoriesForDisplay(
    post.subcategories,
    activeSubcategorySlug
  );

  return (
    <div className={cn("flex h-full flex-col gap-4 px-4 pb-4 pt-2", className)}>
      <div className="flex flex-col gap-3">
        {category && (
          <div className="mb-2 flex min-h-7 flex-wrap items-center gap-2">
            <TagPill tone="category" variant="outline" color={category.pill_color} href={`/blog/categoria/${category.slug}`} className="mr-[2%] px-4 py-1 text-base">
              {category.name}
            </TagPill>
            {orderedSubcategories.map(({ subcategory: sub, active }) => (
              <TagPill
                key={sub.id}
                tone="subcategory"
                href={`/blog/categoria/${category.slug}/${sub.slug}`}
                className={cn(
                  "border-2 border-gray-100 bg-gray-100 px-4 py-1 text-base font-medium text-gray-400 hover:border-gray-300 hover:bg-gray-300 hover:text-gray-700",
                  active && "bg-gray-800 text-white hover:border-gray-700 hover:bg-gray-700"
                )}
              >
                {sub.name}
              </TagPill>
            ))}
          </div>
        )}
        <Link ref={titleRef} href={`/blog/${post.slug}`} className="hover:underline">
          <h2 className={cn("text-3xl lg:text-4xl", titleClassName)}>{post.title}</h2>
        </Link>
        {showExcerpt && post.excerpt && (
          <p
            className={cn(
              "font-excerpt line-clamp-3 mb-6 text-base text-muted-foreground",
              excerptClassName
            )}
          >
            {post.excerpt}
          </p>
        )}
      </div>
      <div ref={authorRef} className="flex items-end justify-between gap-2">
        {authorLabel ? (
          <div className="flex items-center gap-2">
            <AuthorAvatar author={post.author ?? {}} />
            <div className="flex flex-col leading-tight">
              <Link href={`/blog/autor/${post.author?.id}`} className="text-base font-medium text-foreground hover:underline">
                {authorLabel}
              </Link>
              {post.author?.public_title && (
                <span className="text-sm uppercase text-muted-foreground">
                  {post.author.public_title}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div />
        )}
        {post.published_at && (
          <span className="text-sm uppercase text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export function FeaturedPostSection({ post }: FeaturedPostSectionProps) {
  return (
    <div className="grid h-full grid-rows-[minmax(240px,20rem)_auto] gap-4">
      <FeaturedPostImage post={post} />
      <FeaturedPostContent post={post} />
    </div>
  );
}
