import Link from "next/link";
import { APPLICATION_STAGES } from "@/lib/constants";
import { getInternalApplicationDetailRoute } from "@/lib/internal/routes";
import type { InternalApplicationListItem } from "@/lib/internal/queries";
import type { ApplicationStatus } from "@/types/database";

type InternalApplicationsTableProps = {
  applications: InternalApplicationListItem[];
  emptyMessage?: string;
};

const statusLabels: Record<ApplicationStatus, string> = {
  draft: "Borrador",
  active: "Activa",
  in_review: "En revision",
  paused: "Pausada",
  completed: "Completada",
  cancelled: "Cancelada"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getStageLabel(stageSlug: string) {
  return APPLICATION_STAGES.find((stage) => stage.slug === stageSlug)?.label ?? stageSlug;
}

function getClientLabel(application: InternalApplicationListItem) {
  return (
    application.main_contact_name ||
    application.client?.full_name ||
    application.client?.email ||
    "Cliente sin nombre"
  );
}

export function InternalApplicationsTable({
  applications,
  emptyMessage = "Aun no hay solicitudes registradas."
}: InternalApplicationsTableProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">WhatsApp</th>
              <th className="px-4 py-3 font-semibold">Etapa actual</th>
              <th className="px-4 py-3 font-semibold">Avance</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Personas</th>
              <th className="px-4 py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {applications.map((application) => (
              <tr className="align-top text-foreground" key={application.id}>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatDate(application.created_at)}
                </td>
                <td className="px-4 py-4 font-medium">{getClientLabel(application)}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {application.client?.whatsapp_e164 ?? "Sin dato"}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {getStageLabel(application.current_stage)}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {application.progress}%
                  </span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {statusLabels[application.status]}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {application.total_people}
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="font-semibold text-primary transition hover:text-accent"
                    href={getInternalApplicationDetailRoute(application.id)}
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
