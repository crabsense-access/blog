import { notFound } from "next/navigation";

import { PostCard } from "@/components/site/post-card";
import { Pagination } from "@/components/site/pagination";
import { getTagBySlug } from "@/lib/queries/tags";
import { getPublishedPostsByTag, POSTS_PER_PAGE } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
  searchParams,
}: PageProps<"/blog/tag/[slug]">) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const { posts, count } = await getPublishedPostsByTag(slug, page);
  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-medium text-muted-foreground">Tag</p>
      <h1 className="mb-8 text-3xl font-bold">#{tag.name}</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No hay notas con este tag todavía.</p>
      ) : (
        <>
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination basePath={`/blog/tag/${slug}`} page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
