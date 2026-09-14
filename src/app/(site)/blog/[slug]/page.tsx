import { notFound } from "next/navigation";
import { preload } from "react-dom";
import type { Metadata } from "next";

import { TagPill } from "@/components/site/tag-pill";
import { PostCategoriesStickyNav } from "@/components/site/post-categories-sticky-nav";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { LinkedinIcon } from "@/components/site/linkedin-icon";
import { MarkdownContent } from "@/components/site/markdown-content";
import { TableOfContents } from "@/components/site/table-of-contents";
import { Breadcrumb, type BreadcrumbItem } from "@/components/site/breadcrumb";
import { RelatedPostsCarousel } from "@/components/site/related-posts-carousel";
import { RelatedNoteBlock } from "@/components/site/related-note-block";
import { FaqSection } from "@/components/site/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostBySlug, getRelatedPostsBySubcategories } from "@/lib/queries/posts";
import { getPublicCategories } from "@/lib/queries/categories";
import { getSubcategoriesByCategoryId } from "@/lib/queries/subcategories";
import { getAllPublishedGlossaryTermsLight } from "@/lib/queries/glossary";
import { createGlossaryLinker } from "@/lib/glossary-linking";
import {
  extractHeadings,
  insertFaqHeading,
  splitContentAtSourcesHeading,
  splitContentAtMidpointHeading,
  FAQ_SECTION_ID,
} from "@/lib/toc";
import {
  buildBlogPostingSchema,
  buildFAQSchema,
  buildPostBreadcrumbSchema,
} from "@/lib/structured-data";
import { getResponsiveCoverImage } from "@/lib/image-url";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";

// Evita mostrar "Actualizado el" por diferencias de segundos entre
// created_at/updated_at/published_at generadas en el mismo insert — solo
// cuenta como "actualizado" una edición posterior de verdad.
const FRESHNESS_BUFFER_MS = 60_000;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    alternates: {
      canonical: post.canonical_url || `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") notFound();

  // Todas las categorías + sus subcategorías, para el menú sticky de
  // navegación (PostCategoriesStickyNav) — es independiente de la
  // categoría/subcategorías propias de ESTE post (que se siguen mostrando
  // aparte, arriba del título).
  const allCategories = await getPublicCategories();
  const categoriesWithSubcategories = await Promise.all(
    allCategories.map(async (category) => ({
      category,
      subcategories: await getSubcategoriesByCategoryId(category.id),
    }))
  );

  // Defensivo: si la migración de faqs todavía no corrió, la columna no
  // existe y esta propiedad viene undefined — no debe romper la página.
  const faqs = post.faqs ?? [];

  const isUpdated =
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() >
      FRESHNESS_BUFFER_MS;

  // Un único linker por post: el estado de "qué término ya se enlazó" se
  // comparte entre la respuesta rápida, el contenido y las FAQs (en ese
  // orden de lectura) para que solo la primerísima mención de cada término
  // en toda la página quede enlazada, sin importar en qué bloque aparezca.
  const glossaryTerms = await getAllPublishedGlossaryTermsLight();
  const glossaryLinker = createGlossaryLinker(glossaryTerms, [
    post.quick_answer ?? "",
    post.content,
    ...faqs.map((faq) => faq.answer),
  ]);
  const linkedQuickAnswer = post.quick_answer?.trim()
    ? glossaryLinker.link(post.quick_answer)
    : null;
  const linkedContent = glossaryLinker.link(post.content);
  const linkedFaqs = faqs.map((faq) => ({ ...faq, answer: glossaryLinker.link(faq.answer) }));

  const headings = insertFaqHeading(extractHeadings(linkedContent), faqs.length > 0);
  const { before: contentBeforeSources, sources: sourcesContent } = splitContentAtSourcesHeading(
    linkedContent
  );
  const midpointSplit = splitContentAtMidpointHeading(contentBeforeSources);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Blog", href: "/blog" },
  ];
  if (post.category) {
    breadcrumbItems.push({
      label: post.category.name,
      href: `/blog/categoria/${post.category.slug}`,
    });
    const subcategory = post.subcategories[0];
    if (subcategory) {
      breadcrumbItems.push({
        label: subcategory.name,
        href: `/blog/categoria/${post.category.slug}/${subcategory.slug}`,
      });
    }
  }
  breadcrumbItems.push({ label: post.title });

  const relatedPosts = await getRelatedPostsBySubcategories(
    post.subcategories.map((sub) => sub.id),
    post.id,
    10
  );
  const relatedPostsTitle = `Más artículos sobre: ${post.subcategories.map((sub) => sub.name).join(", ")}`;

  // Evita repetir, si es posible, el mismo post que ya aparece primero en
  // el carrusel de "Más artículos sobre" del final de la página.
  const inlineRelatedPost = relatedPosts.length > 1 ? relatedPosts[1] : (relatedPosts[0] ?? null);

  // Es el elemento LCP de la página: precargarlo con prioridad alta recorta
  // el delay entre HTML listo y arranque del fetch de la imagen (ver
  // resourceLoadDelay en un audit de Lighthouse). imageSrcSet/imageSizes
  // hacen que el preload matchee el mismo recurso que el <img> real va a
  // pedir (si no, el browser precarga un candidato que después no usa).
  const coverImage = post.cover_image_url ? getResponsiveCoverImage(post.cover_image_url) : null;
  if (coverImage) {
    preload(coverImage.src, {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: coverImage.srcSet,
      imageSizes: coverImage.sizes,
    });
  }

  return (
    <>
      {/* PostCategoriesStickyNav ya no trae su propio ancho/padding (ver
          comentario en el componente) -- este wrapper (mismo w-[95vw]
          px-10 que antes tenía el <article> solo, ahora movido acá para
          que envuelva a los dos) es lo que angosta su fondo/borde para que
          quede alineado con el contenido de la nota, en vez de pegado a
          los 100vw de la pantalla.
          OJO: tiene que envolver nav + article JUNTOS, no un <div> aparte
          sólo para el nav -- un wrapper que mide únicamente la altura del
          propio nav no le deja "margen" para quedar sticky (position:
          sticky necesita que su contenedor sea más alto que el elemento
          para poder pegarse mientras se scrollea el resto adentro); eso
          fue justamente el bug que rompió el sticky en esta página. Al
          envolver también el <article> (que es toda la nota), el
          contenedor es tan alto como toda la página y el nav tiene de
          sobra dónde quedar pegado. */}
      <div className="mx-auto w-[95vw] px-10">
        <PostCategoriesStickyNav
          categories={categoriesWithSubcategories}
          currentCategoryId={post.category?.id ?? null}
        />
        <article className="py-16">
      <JsonLd data={buildBlogPostingSchema(post)} />
      <JsonLd data={buildPostBreadcrumbSchema(post)} />
      {faqs.length > 0 && <JsonLd data={buildFAQSchema(faqs)} />}
      <Breadcrumb items={breadcrumbItems} className="mb-4" />

      <div className="mb-6">
        {/* Mismo font-family/weight/leading/tracking que el título de las
            cards del slider (home-hero-slider.tsx), pero un poco más
            grande: es un h1 de nota completa, no una card. */}
        <h1 className="font-heading text-4xl font-normal leading-[1.1] sm:text-6xl md:text-[3.2rem] md:tracking-[-1px]">
          {post.title}
        </h1>
      </div>

      {(post.category || post.subcategories.length > 0 || post.published_at) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {(post.category || post.subcategories.length > 0) && (
            <div className="flex flex-wrap items-center gap-3">
              {post.category && (
                <TagPill
                  tone="category"
                  variant="outline"
                  color={post.category.pill_color}
                  href={`/blog/categoria/${post.category.slug}`}
                  className="px-4 py-1 text-base"
                >
                  {post.category.name}
                </TagPill>
              )}
              {post.subcategories.map((sub) => (
                <TagPill
                  key={sub.id}
                  tone="subcategory"
                  href={
                    post.category
                      ? `/blog/categoria/${post.category.slug}/${sub.slug}`
                      : undefined
                  }
                  className="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-500 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
                >
                  {sub.name}
                </TagPill>
              ))}
            </div>
          )}

          {post.published_at && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Publicado el {formatDate(post.published_at)}</span>
              {isUpdated && (
                <>
                  <span aria-hidden="true" className="inline-block size-1 rounded-full bg-muted-foreground" />
                  <span>
                    <span className="font-bold">Actualizado</span> el{" "}
                    <span className="font-bold">{formatDate(post.updated_at)}</span>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverImage.src}
          srcSet={coverImage.srcSet}
          sizes={coverImage.sizes}
          alt={post.title}
          fetchPriority="high"
          decoding="async"
          className="mb-8 h-[42vh] w-full rounded-lg object-cover"
        />
      )}

      <div className="grid grid-cols-[25fr_47fr_28fr] gap-x-16">
        <aside>
          <TableOfContents headings={headings} />
        </aside>

        <div>
          {linkedQuickAnswer && (
            <MarkdownContent content={linkedQuickAnswer} className="prose-lg mb-8" />
          )}

          {midpointSplit && inlineRelatedPost ? (
            <>
              <MarkdownContent content={midpointSplit.before} className="post-content" />
              <RelatedNoteBlock post={inlineRelatedPost} />
              <MarkdownContent content={midpointSplit.after} className="post-content" />
            </>
          ) : (
            <MarkdownContent content={contentBeforeSources} className="post-content" />
          )}

          <FaqSection faqs={linkedFaqs} id={FAQ_SECTION_ID} />

          {sourcesContent && <MarkdownContent content={sourcesContent} className="sources-content" />}
        </div>

        {/* El resto de esta columna queda reservado para contenido futuro
            (ej. related posts, publicidad) — sin estilo por ahora, a
            propósito. */}
        <aside className="border-l border-border pl-11">
          {post.author && (post.author.full_name || post.author.email) && (
            <div className="flex flex-col items-start gap-3">
              <AuthorAvatar author={post.author} className="size-16 text-lg" />
              <div>
                <p className="font-medium text-foreground">
                  {post.author.full_name || post.author.email}
                </p>
                {post.author.public_title && (
                  <p className="text-sm text-muted-foreground">{post.author.public_title}</p>
                )}
              </div>
              {post.author.linkedin_url && (
                <a
                  href={post.author.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver perfil de LinkedIn"
                  className="text-foreground transition-opacity hover:opacity-70"
                >
                  <LinkedinIcon className="size-7" />
                </a>
              )}
            </div>
          )}
        </aside>
      </div>

        <RelatedPostsCarousel title={relatedPostsTitle} posts={relatedPosts} className="mt-32" />
        </article>
      </div>
    </>
  );
}
