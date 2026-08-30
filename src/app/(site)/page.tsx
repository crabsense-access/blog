import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/site/post-card";
import { getPublishedPosts } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { posts } = await getPublishedPosts(1);
  const latestPosts = posts.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
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

      {latestPosts.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Últimas notas</h2>
            <Link href="/blog" className="text-sm font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
