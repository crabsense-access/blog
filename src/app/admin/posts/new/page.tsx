import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getCategories } from "@/lib/queries/categories";
import { getSubcategories } from "@/lib/queries/subcategories";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "../post-form";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const supabase = await createClient();
  const [categories, subcategories, authors, { data: { user } }] = await Promise.all([
    getCategories(),
    getSubcategories(),
    getAllProfilesForAdmin(),
    supabase.auth.getUser(),
  ]);

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
        action={createPost}
      />
    </div>
  );
}
