import { notFound } from "next/navigation";

import { MainBlockFeaturedRow } from "@/components/site/main-block-featured-row";
import { AuthorInfoCard } from "@/components/site/author-info-card";
import { PostCardVerticalContent } from "@/components/site/post-card-vertical";
import { JsonLd } from "@/components/seo/json-ld";
import { getAuthorById, getPublishedPostsByAuthor } from "@/lib/queries/authors";
import { POSTS_PER_PAGE } from "@/lib/queries/posts";
import { buildItemListSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: PageProps<"/blog/autor/[id]">) {
  const { id } = await params;

  const author = await getAuthorById(id);
  if (!author) notFound();

  const { posts: authorPosts } = await getPublishedPostsByAuthor(id, 1);
  const featuredPost = authorPosts[0];
  const secondPost = authorPosts[1];
  const thirdPost = authorPosts[2];
  const moreArticles = authorPosts.slice(3);

  return (
    <div className="mx-auto max-w-[108rem] px-10 pb-16">
      <JsonLd data={buildItemListSchema(moreArticles, 1, POSTS_PER_PAGE)} />

      {featuredPost ? (
        <section className="flex h-[calc(100vh-69px)] w-full flex-col overflow-hidden bg-gray-100 py-12">
          <MainBlockFeaturedRow
            featuredPost={featuredPost}
            relatedPosts={[secondPost, thirdPost].filter((p) => p !== undefined)}
            infoCard={<AuthorInfoCard author={author} className="h-auto shrink-0" />}
          />
        </section>
      ) : (
        <div className="mb-16 max-w-md">
          <AuthorInfoCard author={author} />
        </div>
      )}

      {moreArticles.length > 0 && (
        <section className="mb-16 pt-24">
          <h2 className="mb-6 pl-2 text-2xl font-semibold uppercase">
            Más artículos de {author.full_name ?? "este autor"}
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {moreArticles.map((post) => (
              <div key={post.id} className="pb-10">
                <PostCardVerticalContent post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!featuredPost && (
        <p className="text-muted-foreground">
          Todavía no hay notas publicadas de este autor.
        </p>
      )}
    </div>
  );
}
