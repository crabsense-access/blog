import { FeaturedPostSection } from '@/components/site/featured-post-section';
import { RelatedPostsSidebar } from '@/components/site/related-posts-sidebar';
import { PostCardDetailed } from '@/components/site/post-card-detailed';
import { InstagramPromoBlock } from '@/components/site/instagram-promo-block';
import { CategoryCarouselRow } from '@/components/site/category-carousel-row';
import { ExpertsSection } from '@/components/site/experts-section';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getFeaturedPost,
  getRelatedPublishedPosts,
  getPopularPosts,
} from '@/lib/queries/posts';
import { getCategoryBlocks, getPostsByCategoryId } from '@/lib/queries/category-blocks';
import { getFeaturedExperts } from '@/lib/queries/authors';
import { getTagsByCategory } from '@/lib/queries/tags';
import { buildBlogSchema } from '@/lib/structured-data';

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const [featuredPost, categoryBlocks, experts] = await Promise.all([
    getFeaturedPost(),
    getCategoryBlocks(),
    getFeaturedExperts(),
  ]);
  const relatedPosts = featuredPost
    ? await getRelatedPublishedPosts(featuredPost.id, 3)
    : [];

  const excludeIds = featuredPost
    ? [featuredPost.id, ...relatedPosts.map((post) => post.id)]
    : [];
  const popularPosts = await getPopularPosts(excludeIds, 5);

  // Arma la grilla de 6 celdas: notas populares con el promo de Instagram
  // intercalado en la posición 2 (índice 1), sin importar cuántas notas haya.
  const popularGridItems: Array<
    { type: 'post'; post: (typeof popularPosts)[number] } | { type: 'instagram' }
  > = [
    ...popularPosts.slice(0, 1).map((post) => ({ type: 'post' as const, post })),
    { type: 'instagram' as const },
    ...popularPosts.slice(1).map((post) => ({ type: 'post' as const, post })),
  ];

  const categoryBlocksWithPosts = (
    await Promise.all(
      categoryBlocks.map(async (block) => {
        if (!block.category) return null;
        const [posts, tags] = await Promise.all([
          getPostsByCategoryId(block.category.id, 20),
          getTagsByCategory(block.category.id),
        ]);
        return { category: block.category, posts, tags };
      })
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const blogSchemaPosts = [
    ...(featuredPost ? [featuredPost] : []),
    ...popularGridItems
      .filter((item): item is { type: 'post'; post: (typeof popularPosts)[number] } =>
        item.type === 'post'
      )
      .map((item) => item.post),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLd data={buildBlogSchema(blogSchemaPosts)} />
      <div className="max-w-[108rem] mx-auto px-10 py-12">
        {/* Bloque Principal */}
        {featuredPost && (
          <section className="w-full min-h-[calc(100vh-69px-3rem)] bg-gray-100 pb-28">
            <div className="grid gap-10 md:grid-cols-2">
              <FeaturedPostSection post={featuredPost} />
              <RelatedPostsSidebar relatedPosts={relatedPosts} />
            </div>
          </section>
        )}

        {/* Más vistos */}
        {popularGridItems.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Más vistos</h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {popularGridItems.map((item) =>
                item.type === 'instagram' ? (
                  <InstagramPromoBlock key="instagram" />
                ) : (
                  <PostCardDetailed key={item.post.id} post={item.post} />
                )
              )}
            </div>
          </section>
        )}

        {/* Bloques de categoría */}
        <div className="mb-16 flex flex-col gap-20">
          {categoryBlocksWithPosts.map(({ category, posts, tags }) => (
            <CategoryCarouselRow
              key={category.id}
              categoryName={category.name}
              categorySlug={category.slug}
              posts={posts}
              tags={tags}
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
