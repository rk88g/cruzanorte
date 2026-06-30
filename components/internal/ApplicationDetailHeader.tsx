import { APPLICATION_STAGES } from "@/lib/constants";
import type { InternalApplicationDetail } from "@/lib/internal/queries";
import type { ApplicationStatus } from "@/types/database";

type ApplicationDetailHeaderProps = {
  application: InternalApplicationDetail;
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

function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function getStageLabel(stageSlug: string) {
  return APPLICATION_STAGES.find((stage) => stage.slug === stageSlug)?.label ?? stageSlug;
}

function HeaderMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getShortApplicationId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function ApplicationDetailHeader({ application }: ApplicationDetailHeaderProps) {
  const clientName =
    application.main_contact_name ||
    application.client?.full_name ||
    application.client?.email ||
    "Cliente sin nombre";

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Detalle de solicitud
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Solicitud de {clientName}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            WhatsApp:{" "}
            <span className="font-semibold text-foreground">
              {application.client?.whatsapp_e164 ?? "Sin dato"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <HeaderMetric label="ID corto" value={getShortApplicationId(application.id)} />
        <HeaderMetric label="Estado" value={statusLabels[application.status]} />
        <HeaderMetric label="Etapa" value={getStageLabel(application.current_stage)} />
        <HeaderMetric label="Avance" value={`${application.progress}%`} />
        <HeaderMetric label="Total de personas" value={application.total_people} />
        <HeaderMetric
          label="Fecha solicitada"
          value={formatDateOnly(application.requested_date?.date)}
        />
        <HeaderMetric
          label="Fecha autorizada"
          value={formatDateOnly(application.approved_date?.date)}
        />
        <HeaderMetric label="Creacion" value={formatDate(application.created_at)} />
      </div>
    </section>
  );
}
