import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InternalDocumentsTable } from "@/components/internal/InternalDocumentsTable";
import { InternalShell } from "@/components/internal/InternalShell";
import { getInternalDocuments } from "@/lib/documents";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUSES } from "@/lib/constants";

type InternalDocumentsPageProps = {
  searchParams: Promise<{
    cliente?: string;
    estado?: string;
    solicitud?: string;
    tipo?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Documentos internos",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalDocumentsPage({
  searchParams
}: InternalDocumentsPageProps) {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const filters = await searchParams;
  const documents = await getInternalDocuments();
  const filteredDocuments = documents.filter((document) => {
    const statusMatches = filters.estado ? document.status === filters.estado : true;
    const typeMatches = filters.tipo
      ? document.document_label.toLowerCase().includes(filters.tipo.toLowerCase()) ||
        document.document_type.toLowerCase().includes(filters.tipo.toLowerCase())
      : true;
    const applicationMatches = filters.solicitud
      ? document.application?.id.toLowerCase().includes(filters.solicitud.toLowerCase())
      : true;
    const clientValue = [
      document.application?.main_contact_name,
      document.client?.full_name,
      document.client?.email,
      document.client?.whatsapp_e164
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const clientMatches = filters.cliente
      ? clientValue.includes(filters.cliente.toLowerCase())
      : true;

    return statusMatches && typeMatches && applicationMatches && clientMatches;
  });

  return (
    <InternalShell
      title="Documentos"
      description="Vista general de documentos cargados por clientes para revision interna."
    >
      <div className="space-y-5">
        <form
          autoComplete="off"
          className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2 lg:grid-cols-5"
        >
          <select
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            defaultValue={filters.estado ?? ""}
            name="estado"
          >
            <option value="">Todos los estados</option>
            {DOCUMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {DOCUMENT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <input
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            defaultValue={filters.tipo ?? ""}
            name="tipo"
            placeholder="Tipo de documento"
            type="text"
          />
          <input
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            defaultValue={filters.solicitud ?? ""}
            name="solicitud"
            placeholder="Solicitud"
            type="text"
          />
          <input
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
            defaultValue={filters.cliente ?? ""}
            name="cliente"
            placeholder="Cliente"
            type="text"
          />
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent"
            type="submit"
          >
            Filtrar
          </button>
        </form>

        <InternalDocumentsTable documents={filteredDocuments} />
      </div>
    </InternalShell>
  );
}
