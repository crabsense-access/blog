import type { PostWithRelations } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const SITE_LOGO = "https://crabsense.com/wp-content/uploads/2022/07/crabsense-logo.svg";
const ORG_NAME = "Crabsense";

function publisherSchema() {
  return {
    "@type": "Organization",
    name: ORG_NAME,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
  };
}

export function buildBlogPostingSchema(post: PostWithRelations) {
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.cover_image_url ?? undefined,
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
          ...(post.author.linkedin_url ? { sameAs: [post.author.linkedin_url] } : {}),
        }
      : undefined,
    publisher: publisherSchema(),
  };
}

export function buildBlogSchema(posts: PostWithRelations[], siteUrl: string = SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de Crabsense",
    description: "Análisis, guías y tendencias sobre Analytics, SEO, IA y marketing digital.",
    url: `${siteUrl}/blog`,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${siteUrl}/blog/${post.slug}`,
      datePublished: post.published_at ?? undefined,
      image: post.cover_image_url ?? undefined,
    })),
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

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
    logo: SITE_LOGO,
  };
}
