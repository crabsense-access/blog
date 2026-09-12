import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getClients } from "@/lib/queries/clients";
import { ClientDialog } from "./client-dialog";
import { DeleteClientButton } from "./delete-client-button";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <ClientDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fila</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={client.logo_url}
                  alt={client.name}
                  className="h-8 w-auto max-w-28 object-contain"
                />
              </TableCell>
              <TableCell>{client.name}</TableCell>
              <TableCell className="text-muted-foreground">Fila {client.row_number}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <ClientDialog client={client} />
                <DeleteClientButton id={client.id} name={client.name} />
              </TableCell>
            </TableRow>
          ))}
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                Todavía no hay clientes cargados. Mientras tanto, la home muestra logos
                placeholder.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
