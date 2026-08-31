import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { TagPill } from "@/components/site/tag-pill";
import { AuthorAvatar } from "@/components/site/author-avatar";
import type { PostWithRelations } from "@/lib/types";
import { calculateReadingTime } from "@/lib/reading-time";

interface PostCardDetailedProps {
  post: PostWithRelations;
  size?: "default" | "compact";
  showExcerpt?: boolean;
}

export function PostCardDetailed({
  post,
  size = "default",
  showExcerpt = true,
}: PostCardDetailedProps) {
  const readingTime = calculateReadingTime(post.content);
  const authorLabel = post.author?.full_name || post.author?.email;
  const tagLimit = size === "compact" ? 2 : 3;

  if (size === "compact") {
    return (
      <div className="grid grid-cols-[12rem_1fr] gap-x-6 gap-y-4">
        <PostImage
          src={post.cover_image_url}
          alt={post.title}
          className="row-start-1 h-full w-full rounded-md"
        />

        <div className="row-start-1 flex min-w-0 flex-col justify-center gap-4">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            {post.category ? (
              <TagPill tone="category" color={post.category.pill_color}>
                {post.category.name}
              </TagPill>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1 pr-6">
              {post.published_at && (
                <>
                  <span className="font-bold">
                    {new Date(post.published_at).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>·</span>
                </>
              )}
              <span>{readingTime} min</span>
            </div>
          </div>

          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {/* text-xl trae line-height 1.75rem propio; 2 líneas × 1.75rem = 3.5rem reservados. */}
            <h3 className="line-clamp-2 min-h-14 text-xl font-bold">
              {post.title}
            </h3>
          </Link>
        </div>

        {post.tags.length > 0 && (
          <div className="col-start-2 row-start-2 flex flex-wrap items-center gap-1">
            {post.tags.slice(0, tagLimit).map((tag) => (
              <TagPill key={tag.id} href={`/blog/etiqueta/${tag.slug}`}>
                #{tag.name}
              </TagPill>
            ))}
            {post.tags.length > tagLimit && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - tagLimit}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PostImage
        src={post.cover_image_url}
        alt={post.title}
        className="aspect-video w-full rounded-lg"
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          {post.category ? (
            <TagPill tone="category" color={post.category.pill_color}>
              {post.category.name}
            </TagPill>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {post.published_at && (
              <>
                <span>
                  {new Date(post.published_at).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>·</span>
              </>
            )}
            <span>{readingTime} min</span>
          </div>
        </div>

        <Link href={`/blog/${post.slug}`} className="hover:underline">
          <h3 className="line-clamp-2 font-bold">{post.title}</h3>
        </Link>

        {showExcerpt && post.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {post.tags.slice(0, tagLimit).map((tag) => (
              <TagPill key={tag.id} href={`/blog/etiqueta/${tag.slug}`}>
                #{tag.name}
              </TagPill>
            ))}
            {post.tags.length > tagLimit && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - tagLimit}
              </span>
            )}
          </div>
        )}

        {authorLabel && (
          <div className="mt-auto flex items-center gap-2 pt-2">
            <AuthorAvatar author={post.author ?? {}} />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-foreground">{authorLabel}</span>
              {post.author?.public_title && (
                <span className="text-xs text-muted-foreground">
                  {post.author.public_title}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
