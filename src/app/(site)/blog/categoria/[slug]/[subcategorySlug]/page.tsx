import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/site/post-card";
import { Pagination } from "@/components/site/pagination";
import { JsonLd } from "@/components/seo/json-ld";
import { getSubcategoryWithCategory } from "@/lib/queries/subcategories";
import { getPublishedPostsBySubcategory, POSTS_PER_PAGE } from "@/lib/queries/posts";
import { buildItemListSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export default async function SubcategoryPage({
  params,
  searchParams,
}: PageProps<"/blog/categoria/[slug]/[subcategorySlug]">) {
  const { slug: categorySlug, subcategorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const subcategory = await getSubcategoryWithCategory(categorySlug, subcategorySlug);
  if (!subcategory) notFound();

  const { posts, count } = await getPublishedPostsBySubcategory(
    categorySlug,
    subcategorySlug,
    page
  );
  const totalPages = Math.max(1, Math.ceil(count / POSTS_PER_PAGE));

  return (
    <div className="mx-auto max-w-5xl px-10 py-16">
      <JsonLd data={buildItemListSchema(posts, page, POSTS_PER_PAGE)} />
      <p className="text-sm font-medium text-muted-foreground">
        <Link href={`/blog/categoria/${categorySlug}`} className="hover:underline">
          {subcategory.category.name}
        </Link>
        <span className="mx-1.5">/</span>
        Subcategoría
      </p>
      <h1 className="mb-8 text-3xl font-bold">{subcategory.name}</h1>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No hay notas en esta subcategoría todavía.</p>
      ) : (
        <>
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            basePath={`/blog/categoria/${categorySlug}/${subcategorySlug}`}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
