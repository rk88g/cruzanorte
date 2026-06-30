"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { APPLICATION_STAGES } from "@/lib/constants";
import type { PaymentCommitment } from "@/lib/payments";
import { isStageAtOrAfter } from "@/lib/stages";
import type { ApplicationStage } from "@/types/database";

type ApplicationStageControlProps = {
  applicationId: string;
  blockingPayments?: PaymentCommitment[];
  currentStage: ApplicationStage;
};

type StageResponse = {
  message?: string;
  ok: boolean;
  progress?: number;
};

export function ApplicationStageControl({
  applicationId,
  blockingPayments = [],
  currentStage
}: ApplicationStageControlProps) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState<ApplicationStage>(currentStage);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedStageConfig = useMemo(
    () => APPLICATION_STAGES.find((stage) => stage.slug === selectedStage),
    [selectedStage]
  );
  const currentStageConfig = APPLICATION_STAGES.find((stage) => stage.slug === currentStage);
  const hasBlockingPendingPayments = blockingPayments.length > 0;
  const shouldRequireBlockingPaymentNote =
    hasBlockingPendingPayments && isStageAtOrAfter(selectedStage, "llegada_oficina");

  async function handleSubmit() {
    setError(null);
    setMessage(null);

    if (shouldRequireBlockingPaymentNote && !note.trim()) {
      setError("Agrega el motivo para avanzar con pago pendiente.");
      return;
    }

    const blockingPaymentDetail = blockingPayments
      .map(
        (payment) =>
          `${payment.concept} - ${payment.amount} ${payment.currency} - ${payment.status_label} - ${payment.stage ?? "Sin etapa"}`
      )
      .join("\n");
    const confirmed = window.confirm(
      shouldRequireBlockingPaymentNote
        ? `Esta solicitud tiene pagos pendientes que bloquean el avance.\n\n${blockingPaymentDetail}\n\nDeseas avanzar de todos modos?`
        : "Seguro que deseas cambiar la etapa de esta solicitud?"
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/internal/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          current_stage: selectedStage,
          note,
          pending_payment_ids: shouldRequireBlockingPaymentNote
            ? blockingPayments.map((payment) => payment.id)
            : []
        })
      });
      const result = (await response.json()) as StageResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos actualizar la etapa.");
        return;
      }

      setMessage(result.message ?? "Etapa actualizada.");
      setNote("");
      router.refresh();
    } catch {
      setError("No pudimos actualizar la etapa. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Control de etapa
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Avance manual del proceso
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Etapa actual:{" "}
            <span className="font-semibold text-foreground">
              {currentStageConfig?.label ?? currentStage}
            </span>
          </p>
        </div>
        <div className="w-fit rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          Nuevo avance: {selectedStageConfig?.progress ?? 0}%
        </div>
      </div>

      {shouldRequireBlockingPaymentNote ? (
        <div className="mt-5">
          <Alert variant="danger">
            Esta solicitud tiene pagos pendientes que bloquean el avance. Para avanzar de
            todos modos, agrega una nota interna con el motivo.
          </Alert>
          <div className="mt-3 grid gap-2">
            {blockingPayments.map((payment) => (
              <div
                className="rounded-xl border border-border bg-background/60 p-3 text-sm text-muted-foreground"
                key={payment.id}
              >
                <span className="font-semibold text-foreground">{payment.concept}</span>{" "}
                - {payment.amount} {payment.currency} - {payment.status_label}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto] lg:items-end">
        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="application-stage">
            Nueva etapa
          </label>
          <select
            className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            id="application-stage"
            onChange={(event) => setSelectedStage(event.target.value as ApplicationStage)}
            value={selectedStage}
          >
            {APPLICATION_STAGES.map((stage) => (
              <option key={stage.slug} value={stage.slug}>
                {stage.label} - {stage.progress}%
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="stage-note">
            {shouldRequireBlockingPaymentNote ? "Nota interna obligatoria" : "Nota interna opcional"}
          </label>
          <textarea
            autoComplete="off"
            className="mt-2 min-h-11 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            id="stage-note"
            maxLength={2000}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Agrega contexto interno del cambio"
            value={note}
          />
        </div>

        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleSubmit}
          type="button"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Guardando..." : "Guardar etapa"}
        </button>
      </div>

      {error ? (
        <div className="mt-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      ) : null}
      {message ? (
        <div className="mt-4">
          <Alert>{message}</Alert>
        </div>
      ) : null}
    </section>
  );
}
