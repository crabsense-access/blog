import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LINKEDIN_TYPES, type LinkedInPostType } from "@/lib/linkedin";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { getPostOptionsForLinkedIn } from "@/lib/queries/linkedin";
import { getSuccessCases } from "@/lib/queries/success-cases";
import { LinkedInPostForm } from "../linkedin-post-form";
import { createLinkedInPost } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewLinkedInPostPage({ searchParams }: PageProps<"/admin/linkedin/new">) {
  const { type, date } = await searchParams;
  const initialType =
    typeof type === "string" && type in LINKEDIN_TYPES ? (type as LinkedInPostType) : undefined;

  const [postOptions, cases, profiles] = await Promise.all([
    getPostOptionsForLinkedIn(),
    getSuccessCases().catch(() => []),
    getAllProfilesForAdmin(),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/linkedin" aria-label="Volver">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Nuevo post de LinkedIn</h1>
      </div>
      <LinkedInPostForm
        initialType={initialType}
        postOptions={postOptions}
        cases={cases}
        profiles={profiles}
        action={createLinkedInPost}
        initialDate={typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined}
      />
    </div>
  );
}
