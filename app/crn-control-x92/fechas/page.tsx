import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InternalDatesTable } from "@/components/internal/InternalDatesTable";
import { InternalShell } from "@/components/internal/InternalShell";
import { getInternalAvailableDates } from "@/lib/availableDates";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

export const metadata: Metadata = {
  title: "Fechas disponibles",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalDatesPage() {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const dates = await getInternalAvailableDates();

  return (
    <InternalShell
      title="Fechas disponibles"
      description="Gestion de fechas, cupos y solicitudes relacionadas con el proceso guiado."
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Listado de fechas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea fechas con cupo total y cupo disponible para que el cliente pueda solicitarlas.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent"
            href={INTERNAL_ROUTES.newDate}
          >
            Crear fecha
          </Link>
        </div>

        <InternalDatesTable dates={dates} />
      </div>
    </InternalShell>
  );
}
