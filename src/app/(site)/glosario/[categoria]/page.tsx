import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Breadcrumb, type BreadcrumbItem } from "@/components/site/breadcrumb";
import { getPublishedGlossaryTermsByCategory } from "@/lib/queries/glossary";
import { glossaryCategorySchema, GLOSSARY_CATEGORY_LABELS } from "@/lib/validations/glossary";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/glosario/[categoria]">): Promise<Metadata> {
  const { categoria } = await params;
  const parsed = glossaryCategorySchema.safeParse(categoria);
  if (!parsed.success) return {};

  const label = GLOSSARY_CATEGORY_LABELS[parsed.data];
  return {
    title: `Glosario de ${label}`,
    description: `Todos los términos del glosario de ${label}.`,
  };
}

export default async function GlossaryCategoryPage({
  params,
}: PageProps<"/glosario/[categoria]">) {
  const { categoria } = await params;
  const parsed = glossaryCategorySchema.safeParse(categoria);
  if (!parsed.success) notFound();

  const category = parsed.data;
  const terms = await getPublishedGlossaryTermsByCategory(category);
  const categoryLabel = GLOSSARY_CATEGORY_LABELS[category];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: "Glosario", href: "/glosario" },
    { label: categoryLabel },
  ];

  return (
    <div className="mx-auto w-[95vw] max-w-[80rem] px-10 py-16">
      <Breadcrumb items={breadcrumbItems} className="mb-4" />
      <h1 className="font-heading text-4xl font-normal leading-[1.1] sm:text-6xl">
        Glosario de {categoryLabel}
      </h1>

      {terms.length > 0 ? (
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((term) => (
            <li key={term.id}>
              <Link
                href={`/glosario/${category}/${term.slug}`}
                className="block rounded-xl border-2 border-border bg-muted px-5 py-4 font-medium transition-colors hover:border-foreground"
              >
                {term.term}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-12 text-muted-foreground">
          Todavía no hay términos publicados en esta categoría.
        </p>
      )}
    </div>
  );
}
