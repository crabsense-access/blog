import { notFound } from "next/navigation";
import { preload } from "react-dom";
import type { Metadata } from "next";

import { TagPill } from "@/components/site/tag-pill";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { LinkedinIcon } from "@/components/site/linkedin-icon";
import { MarkdownContent } from "@/components/site/markdown-content";
import { TableOfContents } from "@/components/site/table-of-contents";
import { Breadcrumb, type BreadcrumbItem } from "@/components/site/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostBySlug } from "@/lib/queries/posts";
import {
  extractHeadings,
  insertFaqHeading,
  splitContentAtSourcesHeading,
  FAQ_SECTION_ID,
} from "@/lib/toc";
import {
  buildBlogPostingSchema,
  buildFAQSchema,
  buildPostBreadcrumbSchema,
} from "@/lib/structured-data";
import { optimizeExternalImageUrl } from "@/lib/image-url";

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

  // Defensivo: si la migración de faqs todavía no corrió, la columna no
  // existe y esta propiedad viene undefined — no debe romper la página.
  const faqs = post.faqs ?? [];

  const isUpdated =
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() >
      FRESHNESS_BUFFER_MS;

  const headings = insertFaqHeading(extractHeadings(post.content), faqs.length > 0);
  const { before: contentBeforeSources, sources: sourcesContent } = splitContentAtSourcesHeading(
    post.content
  );

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

  // Es el elemento LCP de la página: precargarlo con prioridad alta recorta
  // el delay entre HTML listo y arranque del fetch de la imagen (ver
  // resourceLoadDelay en un audit de Lighthouse).
  if (post.cover_image_url) {
    preload(optimizeExternalImageUrl(post.cover_image_url), {
      as: "image",
      fetchPriority: "high",
    });
  }

  return (
    <article className="mx-auto w-[95vw] px-10 py-16">
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
                  className="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-400 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
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

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimizeExternalImageUrl(post.cover_image_url)}
          alt={post.title}
          fetchPriority="high"
          decoding="async"
          className="mb-8 h-[42vh] w-full rounded-lg object-cover"
        />
      )}

      <div className="grid grid-cols-[25%_47%_28%] gap-x-16">
        <aside>
          <TableOfContents headings={headings} />
        </aside>

        <div>
          {post.quick_answer?.trim() && (
            <MarkdownContent content={post.quick_answer} className="prose-lg mb-8" />
          )}

          <MarkdownContent content={contentBeforeSources} className="post-content" />

          {faqs.length > 0 && (
            <div className="prose post-content mt-12 mb-20 max-w-none">
              <h2 id={FAQ_SECTION_ID}>Preguntas frecuentes</h2>
              {/* not-prose: las cards se manejan con clases propias, sin
                  pelear con los márgenes/tamaños que el plugin de
                  typography le pondría a los h3/p acá adentro. */}
              <div className="not-prose mt-6 space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="rounded-2xl bg-muted p-6 sm:p-8">
                    {/* Más chico que el h2 "Preguntas frecuentes". */}
                    <h3 className="mb-2 text-xl font-normal lg:text-2xl">{faq.question}</h3>
                    <MarkdownContent content={faq.answer} />
                  </div>
                ))}
              </div>
            </div>
          )}

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
    </article>
  );
}
