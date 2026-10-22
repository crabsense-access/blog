import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLeads } from "@/lib/queries/leads";
import { LEAD_SERVICE_OPTIONS } from "@/lib/validations/lead";
import { DeleteLeadButton, LeadStatusSelect } from "./lead-row-actions";

export const dynamic = "force-dynamic";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(iso));

const serviceLabel = (s: string) => LEAD_SERVICE_OPTIONS.find((o) => o.value === s)?.label ?? s;

export default async function AdminLeadsPage() {
  const leads = await getLeads();
  const nuevos = leads.filter((l) => l.status === "nuevo").length;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Contactos</h1>
        <p className="text-sm text-muted-foreground">
          Consultas del formulario de contacto y del prompt de la home · {leads.length} en total,{" "}
          {nuevos} sin contactar.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Origen</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Sitio web</TableHead>
            <TableHead>Comentario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const email = lead.email ?? (lead.contact_type === "email" ? lead.contact : null);
            const phone = lead.phone ?? (lead.contact_type === "phone" ? lead.contact : null);
            return (
              <TableRow key={lead.id} className="align-top">
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(lead.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={lead.source === "form" ? "default" : "secondary"}>
                    {lead.source === "form" ? "Formulario" : "Prompt"}
                  </Badge>
                </TableCell>
                <TableCell className="grid gap-0.5">
                  {lead.name && <span className="font-medium">{lead.name}</span>}
                  {email && (
                    <a href={`mailto:${email}`} className="text-sm hover:underline">
                      {email}
                    </a>
                  )}
                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      {phone}
                    </a>
                  )}
                </TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">
                  {lead.website_url ? (
                    <a
                      href={lead.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {lead.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  {lead.services.length > 0 && (
                    <div className="mb-1 flex flex-wrap gap-1">
                      {lead.services.map((s) => (
                        <Badge key={s} variant="outline">
                          {serviceLabel(s)}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="line-clamp-4 whitespace-pre-wrap text-sm">{lead.message || "—"}</p>
                </TableCell>
                <TableCell>
                  <LeadStatusSelect id={lead.id} status={lead.status} />
                </TableCell>
                <TableCell className="text-right">
                  <DeleteLeadButton id={lead.id} label={lead.name ?? lead.contact} />
                </TableCell>
              </TableRow>
            );
          })}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Todavía no llegaron contactos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
