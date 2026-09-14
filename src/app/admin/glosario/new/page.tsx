import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { createClient } from "@/lib/supabase/server";
import { GlossaryTermForm } from "../glossary-term-form";
import { createGlossaryTerm } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewGlossaryTermPage() {
  const supabase = await createClient();
  const [authors, {
    data: { user },
  }] = await Promise.all([getAllProfilesForAdmin(), supabase.auth.getUser()]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/glosario">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Nuevo término</h1>
      </div>
      <GlossaryTermForm authors={authors} defaultAuthorId={user?.id} action={createGlossaryTerm} />
    </div>
  );
}
