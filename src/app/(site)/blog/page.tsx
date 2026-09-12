import { HomeHeroSlider } from '@/components/site/home-hero-slider';
import { ScrollTextReveal } from '@/components/site/scroll-text-reveal';
import { ClientLogosCarousel } from '@/components/site/client-logos-carousel';
import { CategoriesSection } from '@/components/site/categories-section';
import { HomeFeaturedRow } from '@/components/site/home-featured-row';
import { PopularPostsCarousel } from '@/components/site/popular-posts-carousel';
import { CategoryCarouselRow } from '@/components/site/category-carousel-row';
import { ExpertsSection } from '@/components/site/experts-section';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getFeaturedPost,
  getRelatedPublishedPosts,
  getPopularPosts,
  getSliderPosts,
} from '@/lib/queries/posts';
import { getCategoryBlocks, getPostsByCategoryId } from '@/lib/queries/category-blocks';
import { getPublicCategories } from '@/lib/queries/categories';
import { getSubcategoriesByCategoryId } from '@/lib/queries/subcategories';
import { getFeaturedExperts } from '@/lib/queries/authors';
import { getPublicClients } from '@/lib/queries/clients';
import { buildBlogSchema, buildBlogBreadcrumbSchema } from '@/lib/structured-data';

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const [featuredPost, categoryBlocks, experts, sliderPosts, allCategories, clients] =
    await Promise.all([
      getFeaturedPost(),
      getCategoryBlocks(),
      getFeaturedExperts(),
      getSliderPosts(3),
      getPublicCategories(),
      getPublicClients(),
    ]);

  const categoriesWithSubcategories = await Promise.all(
    allCategories.map(async (category) => ({
      category,
      subcategories: await getSubcategoriesByCategoryId(category.id),
    }))
  );
  const relatedPosts = featuredPost
    ? await getRelatedPublishedPosts(featuredPost.id, 2)
    : [];

  const excludeIds = featuredPost
    ? [featuredPost.id, ...relatedPosts.map((post) => post.id)]
    : [];
  const popularPosts = await getPopularPosts(excludeIds, 6);

  const categoryBlocksWithPosts = (
    await Promise.all(
      categoryBlocks.map(async (block) => {
        if (!block.category) return null;
        const [posts, subcategories] = await Promise.all([
          getPostsByCategoryId(block.category.id, 20),
          getSubcategoriesByCategoryId(block.category.id),
        ]);
        return { category: block.category, posts, subcategories };
      })
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const blogSchemaPostsMap = new Map<string, (typeof popularPosts)[number]>();
  for (const post of [
    ...(featuredPost ? [featuredPost] : []),
    ...popularPosts,
    ...categoryBlocksWithPosts.flatMap((entry) => entry.posts),
  ]) {
    blogSchemaPostsMap.set(post.id, post);
  }
  const blogSchemaPosts = Array.from(blogSchemaPostsMap.values());

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLd data={buildBlogSchema(blogSchemaPosts)} />
      <JsonLd data={buildBlogBreadcrumbSchema()} />
      <div className="max-w-[108rem] mx-auto px-10 pb-12">
        {sliderPosts.length > 0 && <HomeHeroSlider posts={sliderPosts} />}

        <CategoriesSection categories={categoriesWithSubcategories} />

        <ScrollTextReveal />

        <ClientLogosCarousel clients={clients} />

        {/* Bloque Principal */}
        {featuredPost && (
          <section className="flex h-[calc(100vh-69px)] w-full flex-col overflow-hidden py-12">
            <HomeFeaturedRow featuredPost={featuredPost} relatedPosts={relatedPosts} />
          </section>
        )}

        {/* Más vistos */}
        {popularPosts.length > 0 && (
          <div>
            <PopularPostsCarousel posts={popularPosts} />
          </div>
        )}

        {/* Bloques de categoría */}
        <div className="mb-16 flex flex-col gap-20">
          {categoryBlocksWithPosts.map(({ category, posts, subcategories }) => (
            <CategoryCarouselRow
              key={category.id}
              categoryName={category.name}
              categorySlug={category.slug}
              categoryColor={category.pill_color}
              posts={posts}
              subcategories={subcategories}
              className={category.slug === "ga4" ? "pt-24" : undefined}
            />
          ))}
        </div>

        {!featuredPost && (
          <div className="text-center py-16">
            <p className="text-slate-600 text-lg mb-4">No hay artículos disponibles por el momento.</p>
            <p className="text-slate-500">Vuelve pronto para nuevos contenidos</p>
          </div>
        )}
      </div>

      <ExpertsSection experts={experts} />
    </div>
  );
}
