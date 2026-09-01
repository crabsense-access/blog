import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostImage } from "@/components/site/post-image";
import { TagPill } from "@/components/site/tag-pill";
import type { PostWithRelations } from "@/lib/types";

export function PostCard({ post }: { post: PostWithRelations }) {
  const category = post.category;

  return (
    <Card className="overflow-hidden rounded py-0">
      <PostImage src={post.cover_image_url} alt={post.title} className="h-48 w-full rounded" />
      <CardHeader className="pt-6">
        {category && (
          <div className="mb-2 flex flex-wrap gap-1.5">
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
        <CardTitle>
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {post.excerpt && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        )}
        {post.published_at && (
          <p className="mt-3 text-xs text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
