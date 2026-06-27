import Link from "next/link";
import {
  AVAILABLE_DATE_STATUS_LABELS,
  REQUESTED_DATE_STATUS_LABELS
} from "@/lib/constants";
import type { InternalAvailableDateDetail } from "@/lib/availableDates";
import {
  getInternalApplicationDetailRoute,
  INTERNAL_ROUTES
} from "@/lib/internal/routes";
import { InternalDateDecisionActions } from "@/components/internal/InternalDateDecisionActions";

type InternalDateDetailProps = {
  date: InternalAvailableDateDetail;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function getClientLabel(application: InternalAvailableDateDetail["related_applications"][number]) {
  return (
    application.main_contact_name ||
    application.client?.full_name ||
    application.client?.email ||
    "Cliente sin nombre"
  );
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

export function InternalDateDetail({ date }: InternalDateDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex text-sm font-semibold text-primary transition hover:text-accent"
          href={INTERNAL_ROUTES.dates}
        >
          Volver a fechas
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Fecha disponible
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              {formatDate(date.date)}
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary sm:w-auto"
            href={`${INTERNAL_ROUTES.dates}/${date.id}#editar`}
          >
            Editar fecha
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Ciudad/base" value={date.location_city} />
          <DetailItem label="Cupo total" value={date.capacity_total} />
          <DetailItem label="Cupo disponible" value={date.capacity_available} />
          <DetailItem label="Estado" value={AVAILABLE_DATE_STATUS_LABELS[date.status]} />
          <DetailItem
            label="Solicitudes relacionadas"
            value={date.related_applications.length}
          />
          <DetailItem label="Solicitudes autorizadas" value={date.approved_applications_count} />
          <DetailItem label="Personas solicitadas" value={date.requested_people_count} />
          <DetailItem label="Personas autorizadas" value={date.approved_people_count} />
        </div>

        {date.notes_internal ? (
          <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notas internas
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
              {date.notes_internal}
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Solicitudes
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              Solicitudes que pidieron esta fecha
            </h2>
          </div>
        </div>

        {date.related_applications.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Aun no hay solicitudes relacionadas con esta fecha.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[1040px] w-full text-left text-sm">
              <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-semibold">Cliente</th>
                  <th className="px-3 py-3 font-semibold">WhatsApp</th>
                  <th className="px-3 py-3 font-semibold">Personas</th>
                  <th className="px-3 py-3 font-semibold">Estado de fecha</th>
                  <th className="px-3 py-3 font-semibold">Avance</th>
                  <th className="px-3 py-3 font-semibold">Acciones</th>
                  <th className="px-3 py-3 font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {date.related_applications.map((application) => (
                  <tr className="align-top" key={application.id}>
                    <td className="px-3 py-4 font-medium text-foreground">
                      {getClientLabel(application)}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {application.client?.whatsapp_e164 ?? "Sin dato"}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {application.total_people}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {REQUESTED_DATE_STATUS_LABELS[application.requested_date_status]}
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {application.progress}%
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <InternalDateDecisionActions
                        applicationId={application.id}
                        requestedDateStatus={application.requested_date_status}
                      />
                    </td>
                    <td className="px-3 py-4">
                      <Link
                        className="font-semibold text-primary transition hover:text-accent"
                        href={getInternalApplicationDetailRoute(application.id)}
                      >
                        Ver solicitud
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
