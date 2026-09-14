import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { TagPill } from "@/components/site/tag-pill";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { Breadcrumb, type BreadcrumbItem } from "@/components/site/breadcrumb";
import { MarkdownContent } from "@/components/site/markdown-content";
import { GlossaryFormulaCard } from "@/components/site/glossary-formula-card";
import { GlossaryComparisonTableBlock } from "@/components/site/glossary-comparison-table";
import { FaqSection } from "@/components/site/faq-section";
import { RelatedPostsCarousel } from "@/components/site/related-posts-carousel";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getGlossaryTermBySlug,
  getAllPublishedGlossaryTermsLight,
} from "@/lib/queries/glossary";
import { getPublishedPostsByCategoryRange } from "@/lib/queries/posts";
import { glossaryCategorySchema, GLOSSARY_CATEGORY_LABELS } from "@/lib/validations/glossary";
import { buildGlossaryTermSchema } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

const FAQ_SECTION_ID = "preguntas-frecuentes";
const RELATED_BLOG_POSTS_LIMIT = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/glosario/[categoria]/[slug]">): Promise<Metadata> {
  const { categoria, slug } = await params;
  const parsedCategory = glossaryCategorySchema.safeParse(categoria);
  if (!parsedCategory.success) return {};

  const term = await getGlossaryTermBySlug(parsedCategory.data, slug);
  if (!term) return {};

  return {
    title: term.term,
    description: term.quick_answer ?? undefined,
  };
}

export default async function GlossaryTermPage({
  params,
}: PageProps<"/glosario/[categoria]/[slug]">) {
  const { categoria, slug } = await params;
  const parsedCategory = glossaryCategorySchema.safeParse(categoria);
  if (!parsedCategory.success) notFound();

  const category = parsedCategory.data;
  const term = await getGlossaryTermBySlug(category, slug);
  if (!term) notFound();

  const categoryLabel = GLOSSARY_CATEGORY_LABELS[category];

  const [allTermsLight, { posts: relatedBlogPosts }] = await Promise.all([
    getAllPublishedGlossaryTermsLight(),
    getPublishedPostsByCategoryRange(category, 0, RELATED_BLOG_POSTS_LIMIT),
  ]);

  const termsByName = new Map(allTermsLight.map((t) => [t.term.toLowerCase(), t]));
  const resolvedRelatedTerms = term.related_terms.map((name) => ({
    name,
    match: termsByName.get(name.toLowerCase()) ?? null,
  }));

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Glosario", href: "/glosario" },
    { label: categoryLabel, href: `/glosario/${category}` },
    { label: term.term },
  ];

  const authorLabel = term.author?.full_name || term.author?.email;

  return (
    <article className="mx-auto w-[95vw] max-w-4xl px-10 py-16">
      <JsonLd data={buildGlossaryTermSchema(term)} />

      <Breadcrumb items={breadcrumbItems} className="mb-4" />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <TagPill tone="category" variant="outline" href={`/glosario/${category}`} className="px-4 py-1 text-base">
          {categoryLabel}
        </TagPill>
      </div>

      <h1 className="font-heading text-4xl font-normal leading-[1.1] sm:text-6xl md:text-[3.2rem] md:tracking-[-1px]">
        {term.term}
      </h1>

      <div className="prose post-content mt-6 max-w-none">
        <h2>¿Qué es {term.term}?</h2>
      </div>

      {term.quick_answer && <MarkdownContent content={term.quick_answer} className="prose-lg" />}

      {term.has_formula && term.formula && <GlossaryFormulaCard formula={term.formula} />}

      {term.extended_explanation && (
        <MarkdownContent content={term.extended_explanation} className="post-content mt-8" />
      )}

      {term.example && (
        <div className="prose post-content mt-8 max-w-none">
          <h2>Ejemplo</h2>
          <MarkdownContent content={term.example} />
        </div>
      )}

      {term.comparison_table && <GlossaryComparisonTableBlock table={term.comparison_table} />}

      {resolvedRelatedTerms.length > 0 && (
        <div className="not-prose mt-10">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Términos relacionados</p>
          <div className="flex flex-wrap gap-2">
            {resolvedRelatedTerms.map(({ name, match }) =>
              match ? (
                <TagPill
                  key={name}
                  tone="subcategory"
                  href={`/glosario/${match.category}/${match.slug}`}
                  className="border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-500 hover:border-gray-200 hover:bg-gray-200 hover:text-gray-600"
                >
                  {name}
                </TagPill>
              ) : (
                <span
                  key={name}
                  className="rounded-full border-2 border-gray-100 bg-gray-100 px-4 py-1 text-[15px] font-normal text-gray-500"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      )}

      <FaqSection faqs={term.faqs} id={FAQ_SECTION_ID} />

      {(authorLabel || term.updated_at) && (
        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
          {authorLabel && (
            <div className="flex items-center gap-2">
              <AuthorAvatar author={term.author ?? {}} />
              <span>
                Revisado por <span className="font-medium text-foreground">{authorLabel}</span>
              </span>
            </div>
          )}
          {authorLabel && <span aria-hidden="true">•</span>}
          <span>Última actualización: {formatDate(term.updated_at)}</span>
        </div>
      )}

      <RelatedPostsCarousel
        title={`Ver también en el blog: ${categoryLabel}`}
        posts={relatedBlogPosts}
        className="mt-24"
      />
    </article>
  );
}
