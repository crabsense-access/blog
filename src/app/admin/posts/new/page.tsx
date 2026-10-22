import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getCategories } from "@/lib/queries/categories";
import { getSubcategories } from "@/lib/queries/subcategories";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { getRecentNewsItems } from "@/lib/queries/radar";
import type { NewsItem } from "@/lib/radar-types";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "../post-form";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";
// Buscar referentes y generar con IA pueden tardar 1–3 minutos (server actions de esta página).
export const maxDuration = 300;

export default async function NewPostPage() {
  const supabase = await createClient();
  const [categories, subcategories, authors, { data: { user } }] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getAllProfilesForAdmin(),
    supabase.auth.getUser(),
  ]);
  // Si el radar no está disponible (falta la migración, error), la nota se
  // crea igual: simplemente no se muestran novedades.
  let newsItems: NewsItem[] = [];
  try {
    newsItems = await getRecentNewsItems(7);
  } catch {
    newsItems = [];
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/posts">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Nueva nota</h1>
      </div>
      <PostForm
        categories={categories}
        subcategories={subcategories}
        authors={authors}
        defaultAuthorId={user?.id}
        newsItems={newsItems}
        action={createPost}
      />
    </div>
  );
}
