import Link from "next/link";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import type { InternalDocumentDetail as InternalDocumentDetailData } from "@/lib/documents";
import {
  getInternalApplicationDetailRoute,
  INTERNAL_ROUTES
} from "@/lib/internal/routes";
import { SignedDocumentButton } from "@/components/ui/SignedDocumentButton";

type InternalDocumentDetailProps = {
  document: InternalDocumentDetailData;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sin dato";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatFileSize(value: number | null) {
  if (!value) {
    return "Sin dato";
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-foreground">
        {value ?? "Sin dato"}
      </p>
    </div>
  );
}

export function InternalDocumentDetail({ document }: InternalDocumentDetailProps) {
  const clientLabel =
    document.application?.main_contact_name ||
    document.client?.full_name ||
    document.client?.email ||
    "Cliente sin nombre";

  return (
    <div className="space-y-6">
      <Link
        className="inline-flex text-sm font-semibold text-primary transition hover:text-accent"
        href={INTERNAL_ROUTES.documents}
      >
        Volver a documentos
      </Link>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Documento
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              {document.document_label}
            </h2>
          </div>
          <SignedDocumentButton documentId={document.id} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Cliente" value={clientLabel} />
          <DetailItem label="Solicitud" value={document.application_id} />
          <DetailItem label="Viajero" value={document.traveler?.full_name ?? "General"} />
          <DetailItem label="Estado" value={DOCUMENT_STATUS_LABELS[document.status]} />
          <DetailItem label="Nombre de archivo" value={document.file_name} />
          <DetailItem label="Tipo MIME" value={document.file_mime_type} />
          <DetailItem label="Tamano" value={formatFileSize(document.file_size)} />
          <DetailItem label="Fecha de carga" value={formatDate(document.created_at)} />
          <DetailItem label="Fecha de revision" value={formatDate(document.reviewed_at)} />
          <DetailItem
            label="Requisito Mexico"
            value={document.mexico_requirement?.requirement_name}
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notas del cliente
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
              {document.client_notes ?? "Sin notas del cliente."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notas internas
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
              {document.admin_notes ?? "Sin notas internas."}
            </p>
          </div>
        </div>

        {document.application ? (
          <div className="mt-5">
            <Link
              className="font-semibold text-primary transition hover:text-accent"
              href={getInternalApplicationDetailRoute(document.application.id)}
            >
              Ver solicitud relacionada
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
