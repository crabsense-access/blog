import { notFound } from "next/navigation";

import { CategoryCard } from "@/components/site/category-card";
import { CategoryPostsList } from "@/components/site/category-posts-list";
import { JsonLd } from "@/components/seo/json-ld";
import { loadMoreSubcategoryPosts } from "./actions";
import {
  getSubcategoryWithCategory,
  getSubcategoriesByCategoryId,
} from "@/lib/queries/subcategories";
import { getPublishedPostsBySubcategoryRange } from "@/lib/queries/posts";
import { getPublicSiteSettings } from "@/lib/queries/site-settings";
import { buildItemListSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

export default async function SubcategoryPage({
  params,
}: PageProps<"/blog/categoria/[slug]/[subcategorySlug]">) {
  const { slug: categorySlug, subcategorySlug } = await params;

  const subcategory = await getSubcategoryWithCategory(categorySlug, subcategorySlug);
  if (!subcategory) notFound();

  const [categorySubcategories, siteSettings] = await Promise.all([
    getSubcategoriesByCategoryId(subcategory.category_id),
    getPublicSiteSettings(),
  ]);

  const initialCount = siteSettings.category_page_initial_items;
  const { posts: initialPosts, count: totalCount } = await getPublishedPostsBySubcategoryRange(
    categorySlug,
    subcategorySlug,
    0,
    initialCount
  );

  return (
    <div className="mx-auto max-w-[108rem] px-10 pb-16">
      <JsonLd data={buildItemListSchema(initialPosts, 1, initialCount || 1)} />

      <div className="flex gap-10 pt-12 pb-16">
        <div
          className="sticky h-fit w-[30vw] shrink-0"
          style={{ top: "calc(var(--site-header-height, 4.5rem) + 5%)" }}
        >
          <CategoryCard
            category={subcategory.category}
            subcategories={categorySubcategories}
            activeSubcategorySlug={subcategorySlug}
            imageUrl={subcategory.image_url}
            imageClassName="h-[25vh]"
            subcategoryContainerClassName="bg-transparent"
            subcategoryPillClassName="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-400 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
          />
        </div>
        <div className="min-w-0 flex-1">
          <CategoryPostsList
            initialPosts={initialPosts}
            totalCount={totalCount}
            loadMore={loadMoreSubcategoryPosts.bind(null, categorySlug, subcategorySlug)}
          />
        </div>
      </div>
    </div>
  );
}
