import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllProfilesForAdmin } from "@/lib/queries/authors";
import { getGlossaryTermByIdForAdmin } from "@/lib/queries/glossary";
import { GlossaryTermForm } from "../glossary-term-form";
import { updateGlossaryTerm } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditGlossaryTermPage({
  params,
}: PageProps<"/admin/glosario/[id]">) {
  const { id } = await params;
  const [term, authors] = await Promise.all([
    getGlossaryTermByIdForAdmin(id),
    getAllProfilesForAdmin(),
  ]);

  if (!term) notFound();

  const boundUpdate = updateGlossaryTerm.bind(null, term.id);

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/glosario">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Editar término</h1>
      </div>
      <GlossaryTermForm authors={authors} term={term} action={boundUpdate} />
    </div>
  );
}
