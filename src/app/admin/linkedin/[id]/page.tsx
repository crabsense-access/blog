import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { getLinkedInPostByIdForAdmin, getPostOptionsForLinkedIn } from "@/lib/queries/linkedin";
import { getSuccessCases } from "@/lib/queries/success-cases";
import { LinkedInPostForm } from "../linkedin-post-form";
import { LinkedInSavedToast } from "../saved-toast";
import { updateLinkedInPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditLinkedInPostPage({ params, searchParams }: PageProps<"/admin/linkedin/[id]">) {
  const { id } = await params;
  const { generate } = await searchParams;
  const [post, postOptions, cases, profiles] = await Promise.all([
    getLinkedInPostByIdForAdmin(id),
    getPostOptionsForLinkedIn(),
    getSuccessCases().catch(() => []),
    getAllProfilesForAdmin(),
  ]);

  if (!post) notFound();

  const boundUpdate = updateLinkedInPost.bind(null, post.id);

  return (
    <div className="grid gap-6">
      <LinkedInSavedToast />
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/linkedin" aria-label="Volver">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Editar post de LinkedIn</h1>
      </div>
      <LinkedInPostForm
        post={post}
        postOptions={postOptions}
        cases={cases}
        profiles={profiles}
        action={boundUpdate}
        autoGenerate={generate === "1" && !post.caption}
      />
    </div>
  );
}
