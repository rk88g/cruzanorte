"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ActionButton } from "@/components/ui/ActionButton";
import { Modal } from "@/components/ui/Modal";
import {
  APPLICATION_STAGES,
  PAYMENT_SCOPE_LABELS,
  PAYMENT_SCOPES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES
} from "@/lib/constants";

export type CreatePaymentTravelerOption = {
  full_name: string;
  id: string;
  is_main_client: boolean;
};

type CreatePaymentModalProps = {
  applicationId: string;
  onClose: () => void;
  travelers: CreatePaymentTravelerOption[];
};

type CreatePaymentResponse = {
  message?: string;
  ok: boolean;
};

function getTravelerLabel(traveler: CreatePaymentTravelerOption, index: number) {
  const identifier = `V-${String(index + 1).padStart(2, "0")}`;

  return `${identifier}${traveler.is_main_client ? " - Principal" : ""} ${traveler.full_name}`;
}

function getOptionalText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getOptionalNumber(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return Number(value);
}

export function CreatePaymentModal({
  applicationId,
  onClose,
  travelers
}: CreatePaymentModalProps) {
  const router = useRouter();
  const [paymentScope, setPaymentScope] = useState("application");
  const [isFinanced, setIsFinanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      amount: Number(formData.get("amount")),
      application_id: applicationId,
      blocks_progress: formData.get("blocks_progress") === "on",
      concept: getOptionalText(formData, "concept"),
      currency: formData.get("currency"),
      description: getOptionalText(formData, "description"),
      discount_amount: getOptionalNumber(formData, "discount_amount"),
      discount_percentage: getOptionalNumber(formData, "discount_percentage"),
      due_date: getOptionalText(formData, "due_date"),
      financing_months: getOptionalNumber(formData, "financing_months"),
      is_extra_payment: formData.get("is_extra_payment") === "on",
      is_financed: formData.get("is_financed") === "on",
      payment_scope: formData.get("payment_scope"),
      promotion_name: getOptionalText(formData, "promotion_name"),
      stage: formData.get("stage"),
      status: formData.get("status"),
      traveler_id:
        paymentScope === "traveler" ? getOptionalText(formData, "traveler_id") : undefined
    };

    try {
      const response = await fetch("/api/internal/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as CreatePaymentResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos crear el compromiso de pago.");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("No pudimos crear el compromiso de pago. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      eyebrow="Compromisos de pago"
      onClose={onClose}
      subtitle="Crea pagos manuales por solicitud, grupo, persona, etapa o acuerdo especial."
      title="Crear compromiso de pago"
    >
      <form autoComplete="off" className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="payment-concept">
              Concepto
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-concept"
              maxLength={160}
              name="concept"
              placeholder="Anticipo"
              required
              type="text"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="payment-description">
              Descripcion
            </label>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-description"
              maxLength={2000}
              name="description"
              placeholder="Detalle opcional del compromiso"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-amount">
              Monto
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-amount"
              min="0.01"
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
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue="MXN"
              id="payment-currency"
              name="currency"
              required
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-scope">
              Aplica a
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="payment-scope"
              name="payment_scope"
              onChange={(event) => setPaymentScope(event.target.value)}
              required
              value={paymentScope}
            >
              {PAYMENT_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {PAYMENT_SCOPE_LABELS[scope]}
                </option>
              ))}
            </select>
          </div>

          {paymentScope === "traveler" ? (
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="payment-traveler">
                Persona relacionada
              </label>
              <select
                className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                id="payment-traveler"
                name="traveler_id"
                required
              >
                <option value="">Selecciona persona</option>
                {travelers.map((traveler, index) => (
                  <option key={traveler.id} value={traveler.id}>
                    {getTravelerLabel(traveler, index)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="payment-stage">
              Etapa relacionada
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
            <label className="text-sm font-medium text-foreground" htmlFor="payment-status">
              Estado
            </label>
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              defaultValue="pending"
              id="payment-status"
              name="status"
              required
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PAYMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="financing-months">
              Meses de financiamiento
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              disabled={!isFinanced}
              id="financing-months"
              min="1"
              name="financing_months"
              required={isFinanced}
              type="number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="promotion-name">
              Promocion aplicada
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="promotion-name"
              maxLength={120}
              name="promotion_name"
              type="text"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="discount-amount">
              Descuento en monto
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="discount-amount"
              min="0"
              name="discount_amount"
              step="0.01"
              type="number"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="discount-percentage">
              Descuento en porcentaje
            </label>
            <input
              className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="discount-percentage"
              max="100"
              min="0"
              name="discount_percentage"
              step="0.01"
              type="number"
            />
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 sm:grid-cols-3">
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input className="mt-1" name="blocks_progress" type="checkbox" />
            <span>
              <span className="font-semibold">Bloquea avance</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Si esta activo, se mostrara advertencia antes de avanzar etapas mientras no este pagado.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input className="mt-1" name="is_extra_payment" type="checkbox" />
            <span className="font-semibold">Es pago extra</span>
          </label>
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input
              className="mt-1"
              name="is_financed"
              onChange={(event) => setIsFinanced(event.target.checked)}
              type="checkbox"
            />
            <span className="font-semibold">Tiene financiamiento</span>
          </label>
        </div>

        {error ? <Alert variant="danger">{error}</Alert> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ActionButton disabled={isSubmitting} onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton disabled={isSubmitting} type="submit" variant="primary">
            {isSubmitting ? "Guardando..." : "Crear compromiso"}
          </ActionButton>
        </div>
      </form>
    </Modal>
  );
}
