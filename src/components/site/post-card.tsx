import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostWithRelations } from "@/lib/types";

export function PostCard({ post }: { post: PostWithRelations }) {
  return (
    <Card className="overflow-hidden py-0">
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="h-48 w-full object-cover"
        />
      )}
      <CardHeader className="pt-6">
        {post.category && (
          <Badge variant="secondary" className="mb-2 w-fit">
            {post.category.name}
          </Badge>
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
