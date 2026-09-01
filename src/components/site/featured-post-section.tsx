import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { TagPill } from "@/components/site/tag-pill";
import type { PostWithRelations } from "@/lib/types";
import { calculateReadingTime } from "@/lib/reading-time";

interface FeaturedPostSectionProps {
  post: PostWithRelations;
}

export function FeaturedPostImage({ post }: FeaturedPostSectionProps) {
  return (
    <PostImage
      src={post.cover_image_url}
      alt={post.title}
      className="aspect-[2/1] h-full w-full overflow-hidden rounded"
    />
  );
}

export function FeaturedPostContent({ post }: FeaturedPostSectionProps) {
  const readingTime = calculateReadingTime(post.content);
  const category = post.category;

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col gap-3">
        {category && (
          <div className="flex flex-wrap gap-2">
            <TagPill tone="category" color={category.pill_color}>
              {category.name}
            </TagPill>
            {post.subcategories.map((sub) => (
              <TagPill
                key={sub.id}
                tone="subcategory"
                href={`/blog/categoria/${category.slug}/${sub.slug}`}
              >
                {sub.name}
              </TagPill>
            ))}
          </div>
        )}
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          <h2 className="text-3xl font-bold lg:text-4xl">{post.title}</h2>
        </Link>
        {post.excerpt && (
          <p className="line-clamp-3 text-base text-muted-foreground">
            {post.excerpt}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {(() => {
          const authorLabel = post.author?.full_name || post.author?.email;
          if (!authorLabel) return null;
          return (
            <>
              <AuthorAvatar author={post.author ?? {}} className="size-5 text-[9px]" />
              <Link href={`/blog/autor/${post.author?.id}`} className="hover:underline">
                {authorLabel}
              </Link>
              <span>·</span>
            </>
          );
        })()}
        {post.published_at && (
          <>
            <span>
              {new Date(post.published_at).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>·</span>
          </>
        )}
        <span>{readingTime} min</span>
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
