import { cn } from "@/lib/utils";
import { PostCardDetailed } from "@/components/site/post-card-detailed";
import type { PostWithRelations } from "@/lib/types";

interface RelatedPostsSidebarProps {
  relatedPosts: PostWithRelations[];
}

export function RelatedPostsSidebar({ relatedPosts }: RelatedPostsSidebarProps) {
  return (
    <div className="grid h-full grid-rows-3">
      {relatedPosts.map((post, index) => (
        <div
          key={post.id}
          className={cn(
            "grid items-center px-3 py-2",
            index < relatedPosts.length - 1 && "border-b border-gray-200"
          )}
        >
          <PostCardDetailed post={post} size="compact" showExcerpt={false} />
        </div>
      ))}
    </div>
  );
}
