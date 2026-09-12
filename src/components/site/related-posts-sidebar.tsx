import { Fragment } from "react";

import { MainBlockHorizontalItem } from "@/components/site/main-block-horizontal-item";
import { PromptDownloadBlock } from "@/components/site/prompt-download-block";
import type { PostWithRelations } from "@/lib/types";

interface RelatedPostsSidebarProps {
  relatedPosts: PostWithRelations[];
  itemHeight?: number | null;
  showExcerpt?: boolean;
  showPromptDownload?: boolean;
  activeSubcategorySlug?: string;
}

export function RelatedPostsSidebar({
  relatedPosts,
  itemHeight,
  showExcerpt = true,
  showPromptDownload = true,
  activeSubcategorySlug,
}: RelatedPostsSidebarProps) {
  return (
    <div className="mt-auto flex flex-col">
      {relatedPosts.map((post, index) => (
        <Fragment key={post.id}>
          {index > 0 && <div className="my-5 border-t border-gray-200" />}
          <MainBlockHorizontalItem
            post={post}
            height={itemHeight}
            activeSubcategorySlug={activeSubcategorySlug}
            showExcerpt={showExcerpt}
          />
        </Fragment>
      ))}
      {showPromptDownload && (
        <>
          {relatedPosts.length > 0 && <div className="my-5 border-t border-gray-200" />}
          <div className="px-3">
            <PromptDownloadBlock />
          </div>
        </>
      )}
    </div>
  );
}
