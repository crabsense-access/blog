import Link from "next/link";
import type { Metadata } from "next";

import { getGlossaryCategoryCounts } from "@/lib/queries/glossary";
import { GLOSSARY_CATEGORY_LABELS } from "@/lib/validations/glossary";
import type { GlossaryCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: GlossaryCategory[] = ["ga4", "ads", "ia", "seo"];

const CATEGORY_DESCRIPTIONS: Record<GlossaryCategory, string> = {
  ga4: "Métricas, dimensiones y conceptos de Google Analytics 4.",
  ads: "Términos de Google Ads, Meta Ads y publicidad paga en general.",
  ia: "Inteligencia artificial aplicada a marketing, SEO y contenido.",
  seo: "Posicionamiento orgánico, rastreo, indexación y optimización técnica.",
};

export const metadata: Metadata = {
  title: "Glosario",
  description: "Glosario de términos de GA4, Ads, IA y SEO.",
};

export default async function GlossaryLandingPage() {
  const counts = await getGlossaryCategoryCounts();

  return (
    <div className="mx-auto w-[95vw] max-w-[80rem] px-10 py-16">
      <h1 className="font-heading text-4xl font-normal leading-[1.1] sm:text-6xl">Glosario</h1>
      <p className="font-excerpt mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Definiciones claras de los términos más usados en analítica, publicidad, IA y SEO.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/glosario/${category}`}
            className="group rounded-2xl border-2 border-border bg-muted p-8 transition-colors hover:border-foreground"
          >
            <h2 className="font-heading text-2xl font-normal lg:text-3xl">
              {GLOSSARY_CATEGORY_LABELS[category]}
            </h2>
            <p className="mt-2 text-muted-foreground">{CATEGORY_DESCRIPTIONS[category]}</p>
            <p className="mt-4 text-sm font-medium text-muted-foreground group-hover:text-foreground">
              {counts[category]} {counts[category] === 1 ? "término" : "términos"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
