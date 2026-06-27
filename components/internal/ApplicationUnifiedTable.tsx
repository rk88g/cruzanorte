"use client";

import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DocumentPreviewModal } from "@/components/internal/DocumentPreviewModal";
import { InternalDateDecisionActions } from "@/components/internal/InternalDateDecisionActions";
import type {
  ApplicationUnifiedDocument,
  ApplicationUnifiedRow,
  UnifiedRowPriority,
  UnifiedRowStatus
} from "@/lib/internal/applicationDetail";
import { cn } from "@/lib/utils";
import type { RequestedDateStatus } from "@/types/database";

type ApplicationUnifiedTableProps = {
  applicationId: string;
  requestedDateStatus: RequestedDateStatus;
  rows: ApplicationUnifiedRow[];
};

const statusClassNames: Record<UnifiedRowStatus, string> = {
  Aceptado: "border-success/30 bg-success/10 text-success",
  Autorizado: "border-success/30 bg-success/10 text-success",
  Cargado: "border-primary/30 bg-primary/10 text-primary",
  Completo: "border-success/30 bg-success/10 text-success",
  "En revision": "border-primary/30 bg-primary/10 text-primary",
  "No aplica": "border-border bg-background text-muted-foreground",
  Pendiente: "border-border bg-background text-muted-foreground",
  Pagado: "border-success/30 bg-success/10 text-success",
  Parcial: "border-primary/30 bg-primary/10 text-primary",
  Rechazado: "border-danger/30 bg-danger/10 text-danger",
  "Reemplazo solicitado": "border-danger/30 bg-danger/10 text-danger",
  "Requiere accion": "border-danger/30 bg-danger/10 text-danger",
  Solicitado: "border-primary/30 bg-primary/10 text-primary",
  Vencido: "border-danger/30 bg-danger/10 text-danger",
  Cancelado: "border-border bg-background text-muted-foreground",
  Condicionado: "border-primary/30 bg-primary/10 text-primary",
  "Acuerdo especial": "border-primary/30 bg-primary/10 text-primary"
};

const priorityClassNames: Record<UnifiedRowPriority, string> = {
  Alta: "border-danger/30 bg-danger/10 text-danger",
  Baja: "border-border bg-background text-muted-foreground",
  Media: "border-primary/30 bg-primary/10 text-primary"
};

function Badge({ className, value }: { className: string; value: string }) {
  return (
    <span className={cn("w-fit rounded-full border px-3 py-1 text-xs font-semibold", className)}>
      {value}
    </span>
  );
}

function matchesQuery(row: ApplicationUnifiedRow, query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalized = query.toLowerCase();

  return [
    row.actionLabel,
    row.detail,
    row.identifier,
    row.mainData,
    row.nameOrReference,
    row.responsible,
    row.status,
    row.type
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function RowAction({
  applicationId,
  onSelectDocument,
  requestedDateStatus,
  row
}: {
  applicationId: string;
  onSelectDocument: (document: ApplicationUnifiedDocument) => void;
  requestedDateStatus: RequestedDateStatus;
  row: ApplicationUnifiedRow;
}) {
  if (row.actionType === "view_document" && row.document) {
    return (
      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary"
        onClick={() => onSelectDocument(row.document as ApplicationUnifiedDocument)}
        type="button"
      >
        <FileText className="h-4 w-4" aria-hidden="true" />
        {row.actionLabel}
      </button>
    );
  }

  if (row.actionType === "approve_date") {
    return (
      <InternalDateDecisionActions
        applicationId={applicationId}
        requestedDateStatus={requestedDateStatus}
      />
    );
  }

  if (
    row.actionType === "review_requirement" ||
    row.actionType === "upcoming" ||
    row.actionType === "view_payment"
  ) {
    return <span className="text-sm font-semibold text-muted-foreground">{row.actionLabel}</span>;
  }

  return <span className="text-sm text-muted-foreground">{row.actionLabel}</span>;
}

export function ApplicationUnifiedTable({
  applicationId,
  requestedDateStatus,
  rows
}: ApplicationUnifiedTableProps) {
  const [query, setQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<ApplicationUnifiedDocument | null>(null);
  const visibleRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, query)),
    [query, rows]
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Resumen operativo
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Resumen operativo de la solicitud
          </h2>
        </div>

        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Buscar en tabla</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar identificador, nombre o estado"
            type="search"
            value={query}
          />
        </label>
      </div>

      <div className="mt-5 hidden xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="w-[10%] px-3 py-3 font-semibold">Identificador</th>
              <th className="w-[12%] px-3 py-3 font-semibold">Tipo</th>
              <th className="w-[16%] px-3 py-3 font-semibold">Nombre / Referencia</th>
              <th className="w-[17%] px-3 py-3 font-semibold">Dato principal</th>
              <th className="w-[18%] px-3 py-3 font-semibold">Detalle</th>
              <th className="w-[12%] px-3 py-3 font-semibold">Estado</th>
              <th className="w-[8%] px-3 py-3 font-semibold">Responsable</th>
              <th className="w-[7%] px-3 py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleRows.map((row) => (
              <tr className="align-top" key={row.id}>
                <td className="px-3 py-4 font-semibold text-primary">{row.identifier}</td>
                <td className="px-3 py-4 font-semibold text-foreground">{row.type}</td>
                <td className="break-words px-3 py-4 text-muted-foreground">
                  {row.nameOrReference}
                </td>
                <td className="break-words px-3 py-4 text-foreground">{row.mainData}</td>
                <td className="break-words px-3 py-4 text-muted-foreground">{row.detail}</td>
                <td className="px-3 py-4">
                  <div className="flex flex-col gap-2">
                    <Badge className={statusClassNames[row.status]} value={row.status} />
                    <Badge
                      className={priorityClassNames[row.priority]}
                      value={row.priority}
                    />
                  </div>
                </td>
                <td className="px-3 py-4 text-muted-foreground">{row.responsible}</td>
                <td className="px-3 py-4">
                  <RowAction
                    applicationId={applicationId}
                    onSelectDocument={setSelectedDocument}
                    requestedDateStatus={requestedDateStatus}
                    row={row}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-3 xl:hidden">
        {visibleRows.map((row) => (
          <article className="rounded-xl border border-border bg-background/60 p-4" key={row.id}>
            <div className="flex flex-wrap gap-2">
              <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {row.identifier}
              </span>
              <Badge className={statusClassNames[row.status]} value={row.status} />
              <Badge className={priorityClassNames[row.priority]} value={row.priority} />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {row.type}
            </p>
            <h3 className="mt-2 break-words text-base font-semibold text-foreground">
              {row.mainData}
            </h3>
            <dl className="mt-3 grid gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Nombre / Referencia
                </dt>
                <dd className="mt-1 break-words text-foreground">{row.nameOrReference}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Detalle
                </dt>
                <dd className="mt-1 break-words text-foreground">{row.detail}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Responsable
                </dt>
                <dd className="mt-1 text-foreground">{row.responsible}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Accion
                </dt>
                <dd className="mt-2">
                  <RowAction
                    applicationId={applicationId}
                    onSelectDocument={setSelectedDocument}
                    requestedDateStatus={requestedDateStatus}
                    row={row}
                  />
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {visibleRows.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-background/60 p-6 text-center">
          <p className="text-sm font-semibold text-foreground">No hay coincidencias.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Ajusta la busqueda para ver mas filas de la solicitud.
          </p>
        </div>
      ) : null}

      <DocumentPreviewModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </section>
  );
}
