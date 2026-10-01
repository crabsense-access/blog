import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSuccessCases } from "@/lib/queries/success-cases";
import { successCaseService } from "@/lib/success-cases";
import { CaseDialog } from "./case-dialog";
import { DeleteCaseButton } from "./delete-case-button";

export const dynamic = "force-dynamic";

export default async function AdminSuccessCasesPage() {
  const cases = await getSuccessCases();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Casos de éxito</h1>
          <p className="text-sm text-muted-foreground">
            Se muestran en la home, debajo de &quot;Nuestros servicios&quot;, ordenados por
            &quot;Orden&quot;.
          </p>
        </div>
        <CaseDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Orden</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                {c.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt="" className="h-10 w-16 rounded object-cover" />
                )}
              </TableCell>
              <TableCell className="font-medium">{c.client_name}</TableCell>
              <TableCell className="max-w-72 truncate">{c.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {successCaseService(c.service)?.name ?? "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{c.sort_order}</TableCell>
              <TableCell className="text-muted-foreground">
                {c.is_published ? "Publicado" : "Oculto"}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <CaseDialog item={c} />
                <DeleteCaseButton id={c.id} name={c.client_name} />
              </TableCell>
            </TableRow>
          ))}
          {cases.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Todavía no hay casos cargados. Mientras no haya ninguno publicado, la sección no
                aparece en la home.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
