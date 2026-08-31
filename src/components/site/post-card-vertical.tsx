import { PostCardDetailed } from "@/components/site/post-card-detailed";
import type { PostWithRelations } from "@/lib/types";

export function PostCardVertical({ post }: { post: PostWithRelations }) {
  return (
    <div className="w-[calc((100%-3rem)/3.35)] shrink-0 snap-start">
      <PostCardDetailed post={post} />
    </div>
  );
}
