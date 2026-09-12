import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { TagPill } from "@/components/site/tag-pill";
import { orderSubcategoriesForDisplay } from "@/lib/subcategory-order";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";

interface PostCardVerticalContentProps {
  post: PostWithRelations;
  showCategory?: boolean;
  showSubcategories?: boolean;
  categoryTone?: "brand" | "subcategory";
  activeSubcategorySlug?: string;
  // Overrides opcionales de estilo de las pills — sin usar, el card se ve
  // igual que siempre. Los usa "Más vistos" para igualar el tamaño/estilo
  // de sus pills con las del item destacado del Bloque Principal.
  categoryPillVariant?: "solid" | "outline";
  categoryPillClassName?: string;
  subcategoryPillClassName?: string;
  titleClassName?: string;
  excerptClassName?: string;
}

export function PostCardVerticalContent({
  post,
  showCategory = true,
  showSubcategories = true,
  categoryTone = "brand",
  activeSubcategorySlug,
  categoryPillVariant,
  categoryPillClassName,
  subcategoryPillClassName,
  titleClassName,
  excerptClassName,
}: PostCardVerticalContentProps) {
  const authorLabel = post.author?.full_name || post.author?.email;
  const category = post.category;
  const orderedSubcategories = orderSubcategoriesForDisplay(
    post.subcategories,
    activeSubcategorySlug
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <PostImage
        src={post.cover_image_url}
        alt={post.title}
        className="aspect-video w-full rounded"
      />

      {category && (showCategory || (showSubcategories && post.subcategories.length > 0)) && (
        <div className="mt-2 mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {showCategory && categoryTone === "subcategory" && (
            <TagPill tone="subcategory" href={`/blog/categoria/${category.slug}`} className="text-sm">
              {category.name}
            </TagPill>
          )}
          {showCategory && categoryTone === "brand" && (
            <TagPill
              tone="category"
              variant={categoryPillVariant}
              color={category.pill_color}
              href={`/blog/categoria/${category.slug}`}
              className={cn("text-sm", categoryPillClassName)}
            >
              {category.name}
            </TagPill>
          )}
          {showSubcategories && post.subcategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {orderedSubcategories.map(({ subcategory: sub, active }) => (
                <TagPill
                  key={sub.id}
                  tone="subcategory"
                  href={`/blog/categoria/${category.slug}/${sub.slug}`}
                  className={cn(
                    "text-sm",
                    subcategoryPillClassName,
                    active && "bg-gray-800 text-white hover:bg-gray-700"
                  )}
                >
                  {sub.name}
                </TagPill>
              ))}
            </div>
          )}
        </div>
      )}

      <Link href={`/blog/${post.slug}`} className="hover:underline">
        <h3 className={cn("line-clamp-2 text-xl font-bold text-black", titleClassName)}>
          {post.title}
        </h3>
      </Link>

      {post.excerpt && (
        <p className={cn("font-excerpt line-clamp-2 text-base text-muted-foreground", excerptClassName)}>
          {post.excerpt}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between gap-2 pt-6">
        {authorLabel ? (
          <div className="flex items-center gap-2">
            <AuthorAvatar author={post.author ?? {}} />
            <div className="flex flex-col leading-tight">
              <Link
                href={`/blog/autor/${post.author?.id}`}
                className="text-sm font-medium text-foreground hover:underline"
              >
                {authorLabel}
              </Link>
              {post.author?.public_title && (
                <span className="text-xs uppercase text-muted-foreground">
                  {post.author.public_title}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div />
        )}
        {post.published_at && (
          <span className="text-xs uppercase text-muted-foreground">
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

interface PostCardVerticalProps {
  post: PostWithRelations;
  showCategory?: boolean;
  showSubcategories?: boolean;
  activeSubcategorySlug?: string;
  categoryPillVariant?: "solid" | "outline";
  categoryPillClassName?: string;
  subcategoryPillClassName?: string;
  titleClassName?: string;
  excerptClassName?: string;
}

export function PostCardVertical({
  post,
  showCategory = true,
  showSubcategories = true,
  activeSubcategorySlug,
  categoryPillVariant,
  categoryPillClassName,
  subcategoryPillClassName,
  titleClassName,
  excerptClassName,
}: PostCardVerticalProps) {
  return (
    <div className="w-[calc((100%-3rem)/3.2)] shrink-0 snap-start">
      <PostCardVerticalContent
        post={post}
        showCategory={showCategory}
        showSubcategories={showSubcategories}
        categoryPillVariant={categoryPillVariant}
        categoryPillClassName={categoryPillClassName}
        subcategoryPillClassName={subcategoryPillClassName}
        titleClassName={titleClassName}
        excerptClassName={excerptClassName}
        activeSubcategorySlug={activeSubcategorySlug}
      />
    </div>
  );
}
