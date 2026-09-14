import type { PostFaq, PostWithRelations, GlossaryTermWithRelations } from "@/lib/types";
import { GLOSSARY_CATEGORY_LABELS } from "@/lib/validations/glossary";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const SITE_LOGO = "https://crabsense.com/wp-content/uploads/2022/07/crabsense-logo.svg";
const ORG_NAME = "Crabsense";

function publisherSchema() {
  return {
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
  };
}

export function buildBlogPostingSchema(post: PostWithRelations) {
  const url = `${SITE_URL}/blog/${post.slug}`;

  // "amerita" keywords solo si hay categoría y/o subcategorías cargadas.
  const keywords = [post.category?.name, ...post.subcategories.map((sub) => sub.name)]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image_url
      ? {
          "@type": "ImageObject",
          url: post.cover_image_url,
        }
      : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: post.author?.full_name
      ? {
          "@type": "Person",
          name: post.author.full_name,
          url: `${SITE_URL}/blog/autor/${post.author.id}`,
          ...(post.author.linkedin_url ? { sameAs: [post.author.linkedin_url] } : {}),
        }
      : undefined,
    publisher: publisherSchema(),
    articleSection: post.category?.name,
    keywords: keywords || undefined,
  };
}

export function buildBlogSchema(posts: PostWithRelations[], siteUrl: string = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de Crabsense",
    description: "Análisis, guías y tendencias sobre Analytics, SEO, IA y marketing digital.",
    url: `${siteUrl}/blog`,
    publisher: publisherSchema(),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.published_at ?? undefined,
      image: post.cover_image_url ?? undefined,
    })),
  };
}

export function buildPostBreadcrumbSchema(post: PostWithRelations, siteUrl: string = SITE_URL) {
  const items: { name: string; item: string }[] = [
    { name: "Inicio", item: siteUrl },
    { name: "Blog", item: `${siteUrl}/blog` },
  ];

  if (post.category) {
    items.push({
      name: post.category.name,
      item: `${siteUrl}/blog/categoria/${post.category.slug}`,
    });

    const subcategory = post.subcategories[0];
    if (subcategory) {
      items.push({
        name: subcategory.name,
        item: `${siteUrl}/blog/categoria/${post.category.slug}/${subcategory.slug}`,
      });
    }
  }

  items.push({ name: post.title, item: `${siteUrl}/blog/${post.slug}` });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function buildBlogBreadcrumbSchema(siteUrl: string = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
    ],
  };
}

export function buildItemListSchema(
  posts: PostWithRelations[],
  page: number,
  postsPerPage: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: (page - 1) * postsPerPage + index + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
    })),
  };
}

export function buildFAQSchema(faqs: PostFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// JSON-LD combinado (@graph) para la página de un término de glosario:
// DefinedTerm (anidado en un DefinedTermSet por categoría), BreadcrumbList,
// y FAQPage si el término tiene preguntas frecuentes cargadas.
export function buildGlossaryTermSchema(term: GlossaryTermWithRelations) {
  const categoryLabel = GLOSSARY_CATEGORY_LABELS[term.category];
  const url = `${SITE_URL}/glosario/${term.category}/${term.slug}`;
  const categoryUrl = `${SITE_URL}/glosario/${term.category}`;
  const glossaryUrl = `${SITE_URL}/glosario`;

  const breadcrumbItems = [
    { name: "Inicio", item: SITE_URL },
    { name: "Glosario", item: glossaryUrl },
    { name: categoryLabel, item: categoryUrl },
    { name: term.term, item: url },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graph: any[] = [
    {
      "@type": "DefinedTerm",
      "@id": `${url}#term`,
      name: term.term,
      description: term.quick_answer || undefined,
      url,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        "@id": `${categoryUrl}#termset`,
        name: `Glosario de ${categoryLabel}`,
        url: categoryUrl,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.item,
      })),
    },
  ];

  if (term.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: term.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
  };
}
