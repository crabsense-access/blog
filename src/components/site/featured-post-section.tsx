import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { PostWithRelations } from "@/lib/types";
import { calculateReadingTime } from "@/lib/reading-time";

interface FeaturedPostSectionProps {
  post: PostWithRelations;
}

export function FeaturedPostSection({ post }: FeaturedPostSectionProps) {
  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="flex flex-col gap-4">
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="h-96 w-full rounded-lg object-cover"
        />
      )}
      <div className="flex flex-col gap-3">
        {post.category && (
          <Badge variant="secondary" className="w-fit">
            {post.category.name}
          </Badge>
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
        {post.author_id && (
          <>
            <span>Autor desconocido</span>
            <span>·</span>
          </>
        )}
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
