import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { AVAILABLE_DATE_STATUS_LABELS } from "@/lib/constants";
import type { InternalAvailableDateListItem } from "@/lib/availableDates";
import { getInternalDateDetailRoute, INTERNAL_ROUTES } from "@/lib/internal/routes";

type InternalDatesTableProps = {
  dates: InternalAvailableDateListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

export function InternalDatesTable({ dates }: InternalDatesTableProps) {
  if (dates.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <CalendarPlus className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Aun no hay fechas disponibles.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Crea la primera fecha para que los clientes puedan solicitarla desde su panel.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent"
          href={INTERNAL_ROUTES.newDate}
        >
          Crear fecha
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-[940px] w-full text-left text-sm">
          <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Ciudad/base</th>
              <th className="px-4 py-3 font-semibold">Cupo total</th>
              <th className="px-4 py-3 font-semibold">Cupo disponible</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Solicitudes relacionadas</th>
              <th className="px-4 py-3 font-semibold">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dates.map((date) => (
              <tr className="align-top text-foreground" key={date.id}>
                <td className="px-4 py-4 font-medium">{formatDate(date.date)}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {date.location_city ?? "Sin dato"}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{date.capacity_total}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {date.capacity_available}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {AVAILABLE_DATE_STATUS_LABELS[date.status]}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {date.related_applications_count} total / {date.approved_applications_count} autorizadas
                </td>
                <td className="px-4 py-4">
                  <Link
                    className="font-semibold text-primary transition hover:text-accent"
                    href={getInternalDateDetailRoute(date.id)}
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
