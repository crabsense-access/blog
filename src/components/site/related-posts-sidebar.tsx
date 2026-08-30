import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HighlightBanner } from "./highlight-banner";
import type { PostWithRelations } from "@/lib/types";
import { calculateReadingTime } from "@/lib/reading-time";

interface RelatedPostsSidebarProps {
  relatedPosts: PostWithRelations[];
}

export function RelatedPostsSidebar({ relatedPosts }: RelatedPostsSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <HighlightBanner
        title="Recursos para tu blog"
        imageUrl="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"
      />

      <div className="flex flex-col gap-4">
        {relatedPosts.map((post, index) => {
          const readingTime = calculateReadingTime(post.content);
          return (
            <div key={post.id}>
              <div className="flex gap-4">
                {post.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-20 w-32 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    <h4 className="line-clamp-2 font-medium text-foreground">
                      {post.title}
                    </h4>
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {post.published_at && (
                      <>
                        <span>
                          {new Date(post.published_at).toLocaleDateString(
                            "es-AR",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <span>·</span>
                      </>
                    )}
                    <span>{readingTime} min</span>
                    {post.category && (
                      <>
                        <span>·</span>
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          {post.category.name}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {index < relatedPosts.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
