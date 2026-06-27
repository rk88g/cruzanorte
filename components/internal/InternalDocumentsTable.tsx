import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import type { InternalDocumentListItem } from "@/lib/documents";
import { getInternalDocumentDetailRoute } from "@/lib/internal/routes";

type InternalDocumentsTableProps = {
  documents: InternalDocumentListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getClientLabel(document: InternalDocumentListItem) {
  return (
    document.application?.main_contact_name ||
    document.client?.full_name ||
    document.client?.email ||
    "Cliente sin nombre"
  );
}

export function InternalDocumentsTable({ documents }: InternalDocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <FolderOpen className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Aun no hay documentos cargados.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Cuando los clientes suban archivos, apareceran en esta vista.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full text-left text-sm">
          <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Documento</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Solicitud</th>
              <th className="px-4 py-3 font-semibold">Viajero</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha de carga</th>
              <th className="px-4 py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((document) => (
              <tr className="align-top text-foreground" key={document.id}>
                <td className="px-4 py-4 font-medium">
                  {document.file_name ?? document.document_label}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{getClientLabel(document)}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {document.application?.id ?? "Sin dato"}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {document.traveler?.full_name ?? "General"}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{document.document_label}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {DOCUMENT_STATUS_LABELS[document.status]}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatDate(document.created_at)}
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="font-semibold text-primary transition hover:text-accent"
                    href={getInternalDocumentDetailRoute(document.id)}
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
