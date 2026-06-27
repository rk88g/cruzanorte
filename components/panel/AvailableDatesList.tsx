"use client";

import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { AVAILABLE_DATE_STATUS_LABELS } from "@/lib/constants";
import type { ClientAvailableDate } from "@/lib/availableDates";

type AvailableDatesListProps = {
  availableDates: ClientAvailableDate[];
};

type RequestDateResponse = {
  message?: string;
  ok: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

export function AvailableDatesList({ availableDates }: AvailableDatesListProps) {
  const router = useRouter();
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleRequestDate(availableDateId: string) {
    setSelectedDateId(availableDateId);
    setFormError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/application-date/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ available_date_id: availableDateId })
      });
      const result = (await response.json()) as RequestDateResponse;

      if (!response.ok || !result.ok) {
        setFormError(result.message ?? "No pudimos solicitar la fecha.");
        return;
      }

      setStatusMessage(
        result.message ??
          "Tu fecha fue enviada para revision. Te avisaremos cuando sea autorizada."
      );
      router.refresh();
    } catch {
      setFormError("No pudimos solicitar la fecha. Intenta nuevamente.");
    } finally {
      setSelectedDateId(null);
    }
  }

  if (availableDates.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-premium backdrop-blur-xl">
        <CalendarDays className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          No hay fechas disponibles por ahora.
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Revisa nuevamente mas adelante. Mantendremos el avance del proceso organizado en tu
          panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {formError ? <Alert variant="danger">{formError}</Alert> : null}
      {statusMessage ? <Alert>{statusMessage}</Alert> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {availableDates.map((availableDate) => (
          <article
            className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl"
            key={availableDate.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  Fecha disponible
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  {formatDate(availableDate.date)}
                </h2>
              </div>
              <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {AVAILABLE_DATE_STATUS_LABELS[availableDate.status]}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                  Ciudad/base
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {availableDate.location_city ?? "Por confirmar"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UsersRound className="h-4 w-4 text-primary" aria-hidden="true" />
                  Cupo disponible
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {availableDate.capacity_available} lugares
                </p>
              </div>
            </div>

            <button
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              disabled={selectedDateId === availableDate.id}
              onClick={() => handleRequestDate(availableDate.id)}
              type="button"
            >
              {selectedDateId === availableDate.id ? "Enviando..." : "Solicitar fecha"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
