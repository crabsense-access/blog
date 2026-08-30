import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/queries/categories";
import { getTags } from "@/lib/queries/tags";
import { getPostByIdForAdmin } from "@/lib/queries/posts";
import { PostForm } from "../post-form";
import { updatePost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: PageProps<"/admin/posts/[id]">) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    getPostByIdForAdmin(id),
    getCategories(),
    getTags(),
  ]);

  if (!post) notFound();

  const boundUpdatePost = updatePost.bind(null, post.id);

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/posts">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Editar nota</h1>
      </div>
      <PostForm categories={categories} tags={tags} post={post} action={boundUpdatePost} />
    </div>
  );
}
