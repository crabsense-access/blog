import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllGlossaryTermsForAdmin } from "@/lib/queries/glossary";
import { GlossaryTermsTable } from "./glossary-terms-table";

export const dynamic = "force-dynamic";

export default async function AdminGlossaryPage() {
  const terms = await getAllGlossaryTermsForAdmin();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Glosario</h1>
        <Button asChild>
          <Link href="/admin/glosario/new">
            <PlusIcon />
            Nuevo término
          </Link>
        </Button>
      </div>

      <GlossaryTermsTable terms={terms} />
    </div>
  );
}
