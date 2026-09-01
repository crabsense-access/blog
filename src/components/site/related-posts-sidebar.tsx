import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { PostCardDetailed } from "@/components/site/post-card-detailed";
import { PromptDownloadBlock } from "@/components/site/prompt-download-block";
import type { PostWithRelations } from "@/lib/types";

interface RelatedPostsSidebarProps {
  relatedPosts: PostWithRelations[];
  alignTop?: boolean;
  showPromptDownload?: boolean;
  leadingItem?: ReactNode;
}

export function RelatedPostsSidebar({
  relatedPosts,
  alignTop = true,
  showPromptDownload = true,
  leadingItem,
}: RelatedPostsSidebarProps) {
  return (
    <div className={cn("grid", alignTop && "self-start")}>
      {leadingItem && <div className="px-3">{leadingItem}</div>}
      {relatedPosts.map((post, index) => (
        <div key={post.id}>
          {(index > 0 || leadingItem) && <div className="my-5 border-t border-gray-200" />}
          <div className="px-3">
            <PostCardDetailed post={post} size="compact" showExcerpt={false} />
          </div>
        </div>
      ))}
      {showPromptDownload && (
        <div className="mt-8 px-3">
          <PromptDownloadBlock />
        </div>
      )}
    </div>
  );
}
