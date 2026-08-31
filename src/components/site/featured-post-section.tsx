import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { TagPill } from "@/components/site/tag-pill";
import type { PostWithRelations } from "@/lib/types";
import { calculateReadingTime } from "@/lib/reading-time";

interface FeaturedPostSectionProps {
  post: PostWithRelations;
}

export function FeaturedPostSection({ post }: FeaturedPostSectionProps) {
  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="grid h-full grid-rows-[minmax(240px,1fr)_auto] gap-4">
      <PostImage
        src={post.cover_image_url}
        alt={post.title}
        className="min-h-0 overflow-hidden rounded-lg"
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-3">
          {post.category && (
            <TagPill tone="category" color={post.category.pill_color}>
              {post.category.name}
            </TagPill>
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
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {(() => {
            const authorLabel = post.author?.full_name || post.author?.email;
            if (!authorLabel) return null;
            return (
              <>
                <AuthorAvatar author={post.author ?? {}} className="size-6 text-[10px]" />
                <span>{authorLabel}</span>
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
    </div>
  );
}
