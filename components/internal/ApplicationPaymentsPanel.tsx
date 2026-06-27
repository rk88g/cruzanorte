"use client";

import { CreditCard, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import {
  APPLICATION_STAGES,
  PAYMENT_SCOPE_LABELS,
  PAYMENT_SCOPES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES
} from "@/lib/constants";
import type { PaymentCommitment } from "@/lib/payments";
import type { InternalApplicationDetail } from "@/lib/internal/queries";
import type { PaymentStatus } from "@/types/database";

type ApplicationPaymentsPanelProps = {
  applicationId: string;
  hasBlockingPendingPayments: boolean;
  payments: PaymentCommitment[];
  travelers: InternalApplicationDetail["travelers"];
};

type ApiResponse = {
  message?: string;
  ok: boolean;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    currency,
    style: "currency"
  }).format(amount);
}

function formatDate(value: string | null) {
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

function PaymentStatusControl({ payment }: { payment: PaymentCommitment }) {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>(payment.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/internal/payments/${payment.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos actualizar el pago.");
        return;
      }

      router.refresh();
    } catch {
      setError("No pudimos actualizar el pago. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <select
          className="min-h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          onChange={(event) => setStatus(event.target.value as PaymentStatus)}
          value={status}
        >
          {PAYMENT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {PAYMENT_STATUS_LABELS[item]}
            </option>
          ))}
        </select>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleUpdate}
          type="button"
        >
          {isSubmitting ? "Guardando..." : "Actualizar"}
        </button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function ApplicationPaymentsPanel({
  applicationId,
  hasBlockingPendingPayments,
  payments,
  travelers
}: ApplicationPaymentsPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      amount: formData.get("amount"),
      application_id: applicationId,
      blocks_progress: formData.get("blocks_progress") === "on",
      concept: formData.get("concept"),
      currency: formData.get("currency") || "MXN",
      description: formData.get("description"),
      discount_amount: formData.get("discount_amount"),
      discount_percentage: formData.get("discount_percentage"),
      due_date: formData.get("due_date"),
      financing_months: formData.get("financing_months"),
      is_extra_payment: formData.get("is_extra_payment") === "on",
      is_financed: formData.get("is_financed") === "on",
      payment_scope: formData.get("payment_scope"),
      promotion_name: formData.get("promotion_name"),
      stage: formData.get("stage"),
      status: formData.get("status"),
      traveler_id: formData.get("traveler_id")
    };

    try {
      const response = await fetch("/api/internal/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos crear el compromiso de pago.");
        return;
      }

      setMessage(result.message ?? "Compromiso de pago creado.");
      event.currentTarget.reset();
      router.refresh();
    } catch {
      setError("No pudimos crear el compromiso de pago. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Compromisos de pago
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Pagos manuales de la solicitud
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Registra compromisos de pago sin activar pagos online.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {hasBlockingPendingPayments ? (
        <div className="mt-5">
          <Alert variant="danger">
            Esta solicitud tiene pagos pendientes que bloquean el avance.
          </Alert>
        </div>
      ) : null}

      <form autoComplete="off" className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-concept">
              Concepto
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-concept"
              maxLength={160}
              name="concept"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-amount">
              Monto
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-amount"
              min="0"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-currency">
              Moneda
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm uppercase text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue="MXN"
              id="payment-currency"
              maxLength={3}
              name="currency"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-scope">
              Alcance
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue="documentation"
              id="payment-scope"
              name="payment_scope"
            >
              {PAYMENT_SCOPES.filter((scope) => scope !== "mexico_entry_requirement").map(
                (scope) => (
                  <option key={scope} value={scope}>
                    {PAYMENT_SCOPE_LABELS[scope]}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-traveler">
              Persona
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-traveler"
              name="traveler_id"
            >
              <option value="">No aplica</option>
              {travelers.map((traveler) => (
                <option key={traveler.id} value={traveler.id}>
                  {traveler.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-stage">
              Etapa
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue="documentacion"
              id="payment-stage"
              name="stage"
            >
              {APPLICATION_STAGES.map((stage) => (
                <option key={stage.slug} value={stage.slug}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-status">
              Estado
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue="pending"
              id="payment-status"
              name="status"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PAYMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px_180px]">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-description">
              Descripcion
            </label>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-description"
              maxLength={2000}
              name="description"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-due-date">
              Fecha limite
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-due-date"
              name="due_date"
              type="date"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-discount">
              Descuento
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-discount"
              min="0"
              name="discount_amount"
              step="0.01"
              type="number"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-months">
              Meses
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-months"
              min="1"
              name="financing_months"
              type="number"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input className="h-4 w-4 accent-primary" name="blocks_progress" type="checkbox" />
            Bloquea avance
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input className="h-4 w-4 accent-primary" name="is_extra_payment" type="checkbox" />
            Pago extra
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input className="h-4 w-4 accent-primary" name="is_financed" type="checkbox" />
            Financiamiento
          </label>
          <div>
            <label className="sr-only" htmlFor="payment-promotion">
              Promocion
            </label>
            <input
              className="min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-promotion"
              maxLength={120}
              name="promotion_name"
              placeholder="Promocion opcional"
            />
          </div>
        </div>

        {error ? <Alert variant="danger">{error}</Alert> : null}
        {message ? <Alert>{message}</Alert> : null}

        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Guardando..." : "Crear compromiso"}
        </button>
      </form>

      <div className="mt-6">
        {payments.length === 0 ? (
          <div className="rounded-xl border border-border bg-background/60 p-5 text-sm text-muted-foreground">
            Aun no hay compromisos de pago registrados.
          </div>
        ) : (
          <div className="grid gap-3">
            {payments.map((payment, index) => (
              <article
                className="rounded-xl border border-border bg-background/60 p-4"
                key={payment.id}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      PAY-{String(index + 1).padStart(2, "0")} - {payment.scope_label}
                    </p>
                    <h3 className="mt-2 break-words text-base font-semibold text-foreground">
                      {payment.concept}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {formatMoney(payment.amount, payment.currency)} - Vence:{" "}
                      {formatDate(payment.due_date)} - {payment.status_label}
                    </p>
                    {payment.description ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {payment.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Comprobante:{" "}
                      {payment.latest_receipt?.file_name ?? "Sin comprobante registrado"}
                    </p>
                  </div>
                  <PaymentStatusControl payment={payment} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
