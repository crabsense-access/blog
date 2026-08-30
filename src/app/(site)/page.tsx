import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FeaturedPostSection } from "@/components/site/featured-post-section";
import { RelatedPostsSidebar } from "@/components/site/related-posts-sidebar";
import {
  getFeaturedPost,
  getRelatedPublishedPosts,
  getPublishedPosts,
} from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featuredPost = await getFeaturedPost();
  const { posts: allPosts } = await getPublishedPosts(1);
  const relatedPosts = featuredPost
    ? await getRelatedPublishedPosts(featuredPost.id, 3)
    : allPosts.slice(1, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Bienvenido a Crabsense
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Sitio institucional y blog. Reemplazá este texto por la propuesta
          de valor de la empresa.
        </p>
        <Button asChild className="mt-6">
          <Link href="/blog">Ver el blog</Link>
        </Button>
      </section>

      {/* Featured section: 2 columns on desktop, 1 on mobile */}
      {featuredPost && (
        <section className="mb-16">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left column: Featured post */}
            <FeaturedPostSection post={featuredPost} />

            {/* Right column: Banner + Related posts */}
            {relatedPosts.length > 0 && (
              <RelatedPostsSidebar relatedPosts={relatedPosts} />
            )}
          </div>
        </section>
      )}

      {/* Latest posts grid (from pagination) */}
      {allPosts.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Últimas notas</h2>
            <Link href="/blog" className="text-sm font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Excluir el destacado si existe */}
            {allPosts
              .filter((post) => !featuredPost || post.id !== featuredPost.id)
              .slice(0, 6)
              .map((post) => (
                <div
                  key={post.id}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  {post.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    {post.category && (
                      <div className="mb-2">
                        <span className="inline-block rounded-md bg-secondary px-2 py-1 text-xs font-medium">
                          {post.category.name}
                        </span>
                      </div>
                    )}
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      <h3 className="font-semibold text-foreground">
                        {post.title}
                      </h3>
                    </Link>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    {post.published_at && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {new Date(post.published_at).toLocaleDateString(
                          "es-AR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
