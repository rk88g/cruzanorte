import { PaymentReceiptUploadForm } from "@/components/panel/PaymentReceiptUploadForm";
import type { PaymentCommitment } from "@/lib/payments";

type PaymentCommitmentsPanelProps = {
  payments: PaymentCommitment[];
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

function hasPendingPayments(payments: PaymentCommitment[]) {
  return payments.some(
    (payment) => payment.status !== "paid" && payment.status !== "cancelled"
  );
}

export function PaymentCommitmentsPanel({ payments }: PaymentCommitmentsPanelProps) {
  const hasPending = hasPendingPayments(payments);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Compromisos de pago
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Seguimiento de compromisos
        </h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {payments.length === 0
            ? "Aun no hay compromisos de pago registrados."
            : hasPending
              ? "Tienes compromisos de pago pendientes relacionados con tu proceso."
              : "Tus compromisos de pago registrados no tienen acciones pendientes."}
        </p>
      </div>

      {payments.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {payments.map((payment) => (
            <article
              className="rounded-xl border border-border bg-background/60 p-4"
              key={payment.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {payment.status_label}
                    </span>
                    {payment.blocks_progress ? (
                      <span className="w-fit rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">
                        Bloquea avance
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 break-words text-base font-semibold text-foreground">
                    {payment.concept}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {formatMoney(payment.amount, payment.currency)} - {payment.scope_label} -
                    Vence: {formatDate(payment.due_date)}
                  </p>
                  {payment.stage ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Etapa relacionada: {payment.stage}
                    </p>
                  ) : null}
                  {payment.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {payment.description}
                    </p>
                  ) : null}
                  {payment.latest_receipt ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Comprobante registrado: {payment.latest_receipt.file_name}
                    </p>
                  ) : null}
                </div>
                {payment.status === "paid" || payment.status === "cancelled" ? null : (
                  <PaymentReceiptUploadForm />
                )}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
