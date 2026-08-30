import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getCategories } from "@/lib/queries/categories";
import { getTags } from "@/lib/queries/tags";
import { PostForm } from "../post-form";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

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
      <PostForm categories={categories} tags={tags} action={createPost} />
    </div>
  );
}
