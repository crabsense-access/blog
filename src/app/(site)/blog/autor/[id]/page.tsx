import { notFound } from "next/navigation";

import { PostCard } from "@/components/site/post-card";
import { Pagination } from "@/components/site/pagination";
import { PostImage } from "@/components/site/post-image";
import { JsonLd } from "@/components/seo/json-ld";
import { getAuthorById, getPublishedPostsByAuthor } from "@/lib/queries/authors";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";
import { buildItemListSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export default async function AuthorPage({
  params,
  searchParams,
}: PageProps<"/blog/autor/[id]">) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const author = await getAuthorById(id);
  if (!author) notFound();

  const { posts, count } = await getPublishedPostsByAuthor(id, page);
  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className="mx-auto max-w-5xl px-10 py-16">
      <JsonLd data={buildItemListSchema(posts, page, POSTS_PER_PAGE)} />
      <div className="mb-10 flex items-center gap-4">
        <PostImage
          src={author.avatar_url}
          alt={author.full_name ?? "Autor"}
          className="size-16 shrink-0 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{author.full_name ?? "Autor"}</h1>
          {author.public_title && (
            <p className="text-sm text-muted-foreground">{author.public_title}</p>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no hay notas publicadas de este autor.
        </p>
      ) : (
        <>
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            basePath={`/blog/autor/${id}`}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
