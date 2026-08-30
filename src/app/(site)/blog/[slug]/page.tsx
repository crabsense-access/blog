import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-6">
        {post.category && (
          <Link href={`/blog/categoria/${post.category.slug}`}>
            <Badge variant="secondary" className="mb-4">
              {post.category.name}
            </Badge>
          </Link>
        )}
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        {post.published_at && (
          <p className="mt-3 text-sm text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mb-8 w-full rounded-lg object-cover"
        />
      )}

      <div className="prose max-w-none whitespace-pre-wrap">{post.content}</div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
          {post.tags.map((tag) => (
            <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
              <Badge variant="outline">#{tag.name}</Badge>
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
