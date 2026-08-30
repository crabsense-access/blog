import { PostCard } from "@/components/site/post-card";
import { Pagination } from "@/components/site/pagination";
import { getPublishedPosts, POSTS_PER_PAGE } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage({
  searchParams,
}: PageProps<"/blog">) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const { posts, count } = await getPublishedPosts(page);
  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">Todavía no hay notas publicadas.</p>
      ) : (
        <>
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination basePath="/blog" page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
