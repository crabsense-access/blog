import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostBySlug } from "@/lib/queries/posts";
import { buildBlogPostingSchema } from "@/lib/structured-data";

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

  const authorLabel = post.author?.full_name || post.author?.email;

  return (
    <article className="mx-auto max-w-3xl px-10 py-16">
      <JsonLd data={buildBlogPostingSchema(post)} />
      <div className="mb-6">
        {post.category && (
          <Link href={`/blog/categoria/${post.category.slug}`}>
            <Badge variant="secondary" className="mb-4">
              {post.category.name}
            </Badge>
          </Link>
        )}
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>

        <div className="mt-4 flex items-center gap-3">
          {authorLabel && (
            <>
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
            </>
          )}
          {post.published_at && (
            <p className={authorLabel ? "ml-2 text-sm text-muted-foreground" : "text-sm text-muted-foreground"}>
              {new Date(post.published_at).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
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
    </article>
  );
}
