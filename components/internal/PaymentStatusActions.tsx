"use client";

import { Check, ClipboardCheck, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import type { PaymentCommitment } from "@/lib/payments";
import type { PaymentStatus } from "@/types/database";

type PaymentStatusActionsProps = {
  payment: PaymentCommitment;
  onUpdated?: () => void;
};

type StatusResponse = {
  message?: string;
  ok: boolean;
};

const actions: {
  icon: typeof Check;
  label: string;
  status: Extract<PaymentStatus, "cancelled" | "in_review" | "paid" | "partial" | "rejected">;
}[] = [
  {
    icon: ClipboardCheck,
    label: "Marcar en revision",
    status: "in_review"
  },
  {
    icon: Check,
    label: "Marcar pagado",
    status: "paid"
  },
  {
    icon: RotateCcw,
    label: "Marcar parcial",
    status: "partial"
  },
  {
    icon: X,
    label: "Rechazar comprobante",
    status: "rejected"
  },
  {
    icon: X,
    label: "Cancelar pago",
    status: "cancelled"
  }
];

export function PaymentStatusActions({ payment, onUpdated }: PaymentStatusActionsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<(typeof actions)[number]["status"]>(
    "in_review"
  );
  const [adminNotes, setAdminNotes] = useState(payment.latest_receipt?.admin_notes ?? "");
  const [amountReported, setAmountReported] = useState(
    payment.latest_receipt?.amount_reported?.toString() ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const needsNote = selectedStatus === "rejected";

  async function handleSubmit() {
    setError(null);
    setMessage(null);

    if (needsNote && !adminNotes.trim()) {
      setError("Agrega una nota para rechazar el comprobante.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/internal/payments/${payment.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          admin_notes: adminNotes,
          amount_reported: amountReported,
          receipt_id: payment.latest_receipt?.id,
          status: selectedStatus
        })
      });
      const result = (await response.json()) as StatusResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos actualizar el pago.");
        return;
      }

      setMessage(result.message ?? "Pago actualizado.");
      router.refresh();
      onUpdated?.();
    } catch {
      setError("No pudimos actualizar el pago. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Revision interna
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              selectedStatus === action.status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary"
            }`}
            key={action.status}
            onClick={() => setSelectedStatus(action.status)}
            type="button"
          >
            <action.icon className="h-4 w-4" aria-hidden="true" />
            {action.label}
          </button>
        ))}
      </div>

      {selectedStatus === "partial" ? (
        <div className="mt-4">
          <label className="text-sm font-medium text-foreground" htmlFor="partial-amount">
            Monto parcial reportado
          </label>
          <input
            className="mt-2 min-h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            id="partial-amount"
            min="0"
            onChange={(event) => setAmountReported(event.target.value)}
            step="0.01"
            type="number"
            value={amountReported}
          />
        </div>
      ) : null}

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground" htmlFor="payment-admin-notes">
          Nota interna o visible para cliente
        </label>
        <textarea
          autoComplete="off"
          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="payment-admin-notes"
          maxLength={2000}
          onChange={(event) => setAdminNotes(event.target.value)}
          placeholder={needsNote ? "Explica por que se rechaza el comprobante." : "Opcional"}
          value={adminNotes}
        />
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

      <button
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={isSubmitting}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? "Guardando..." : "Actualizar pago"}
      </button>
    </div>
  );
}
