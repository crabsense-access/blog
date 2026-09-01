import Link from "next/link";

import { PostImage } from "@/components/site/post-image";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";
import { calculateReadingTime } from "@/lib/reading-time";

interface PostCardVerticalContentProps {
  post: PostWithRelations;
  metaPosition?: "top" | "footer";
}

export function PostCardVerticalContent({
  post,
  metaPosition = "top",
}: PostCardVerticalContentProps) {
  const readingTime = calculateReadingTime(post.content);
  const authorLabel = post.author?.full_name || post.author?.email;
  const category = post.category;

  return (
    <div className="flex h-full flex-col gap-3">
      <PostImage
        src={post.cover_image_url}
        alt={post.title}
        className="aspect-video w-full rounded"
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {category && (
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full px-3 py-1 font-medium uppercase",
              !category.pill_color && "bg-primary/10 text-primary"
            )}
            style={
              category.pill_color
                ? { backgroundColor: `${category.pill_color}26`, color: category.pill_color }
                : undefined
            }
          >
            {category.name}
          </span>
        )}
        {metaPosition === "top" && post.published_at && (
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
        {metaPosition === "top" && <span>{readingTime} min</span>}
      </div>

      <Link href={`/blog/${post.slug}`} className="hover:underline">
        <h3 className="line-clamp-2 font-bold text-black">{post.title}</h3>
      </Link>

      {post.excerpt && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
      )}

      {authorLabel && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
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
                <span className="text-xs text-muted-foreground">
                  {post.author.public_title}
                </span>
              )}
            </div>
          </div>
          {metaPosition === "footer" && (
            <div className="flex flex-col items-end text-xs text-muted-foreground">
              {post.published_at && (
                <span className="font-bold">
                  {new Date(post.published_at).toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              <span>{readingTime} min</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PostCardVertical({ post }: { post: PostWithRelations }) {
  return (
    <div className="w-[calc((100%-3rem)/3.35)] shrink-0 snap-start">
      <PostCardVerticalContent post={post} />
    </div>
  );
}
