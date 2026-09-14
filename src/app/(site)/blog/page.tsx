import { HomeHeroSlider } from '@/components/site/home-hero-slider';
import { PostCategoriesStickyNav } from '@/components/site/post-categories-sticky-nav';
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
import { buildBlogSchema, buildBlogBreadcrumbSchema } from '@/lib/structured-data';

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const [featuredPost, categoryBlocks, experts, sliderPosts, allCategories] =
    await Promise.all([
      getFeaturedPost(),
      getCategoryBlocks(),
      getFeaturedExperts(),
      getSliderPosts(3),
      getPublicCategories(),
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

        {/* Menú sticky de categorías y subcategorías, el mismo que en
            la página de post (post-categories-sticky-nav.tsx), en vez de
            las 4 cards de categoría que había antes acá. Sin
            currentCategoryId (no hay un post "actual" en la home, así
            que abre la primera categoría de la lista) y sin la barra de
            progreso de lectura (showReadingProgress=false: acá no hay
            una sola nota cuyo progreso mostrar).

            Acá en la home el <nav> va genuinamente al 100% de la pantalla,
            igual que <header> (que tampoco tiene ancho propio: ver
            site-header.tsx) -- className le pasa DIRECTO al <nav> el
            mismo truco de "full-bleed" que ya se usa en otros bloques del
            sitio (ver client-logos-carousel.tsx), sacándolo del
            contenedor centrado/paddeado de esta página. A propósito NO va
            en un <div> wrapper aparte alrededor de este componente: ese
            wrapper quedaría tan alto como el propio nav (nada más
            adentro) y position:sticky necesita que su contenedor tenga
            más alto que el elemento pegajoso para poder quedarse pegado
            al scrollear -- puesto directo en el <nav>, su padre real
            sigue siendo este div de arriba (con todo el resto de la
            home adentro), así el sticky tiene todo el margen que
            necesita. contentClassName repite el mismo max-w-[108rem]
            mx-auto px-10 que <header> usa para su propio contenido, así
            las pills quedan alineadas con el logo/links de arriba en vez
            de solo evitar que toquen el borde. */}
        <PostCategoriesStickyNav
          categories={categoriesWithSubcategories}
          showReadingProgress={false}
          className="w-screen ml-[calc(50%-50vw)]"
          contentClassName="max-w-[108rem] mx-auto px-10"
        />

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
