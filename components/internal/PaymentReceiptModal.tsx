"use client";

import { Download, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PaymentStatusActions } from "@/components/internal/PaymentStatusActions";
import type { PaymentCommitment } from "@/lib/payments";

type PaymentReceiptModalProps = {
  onClose: () => void;
  payment: PaymentCommitment | null;
};

type SignedUrlResponse = {
  message?: string;
  ok: boolean;
  signed_url?: string;
};

function formatMoney(amount: number | null, currency: string) {
  if (amount === null) {
    return "Sin monto";
  }

  return new Intl.NumberFormat("es-MX", {
    currency,
    style: "currency"
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function isPdf(fileName: string | null | undefined) {
  return Boolean(fileName?.toLowerCase().endsWith(".pdf"));
}

function isImage(fileName: string | null | undefined) {
  return Boolean(fileName?.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/));
}

export function PaymentReceiptModal({ onClose, payment }: PaymentReceiptModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const receipt = payment?.latest_receipt ?? null;

  useEffect(() => {
    if (!receipt) {
      return;
    }

    let isActive = true;
    const activeReceiptId = receipt.id;

    async function loadSignedUrl() {
      setIsLoading(true);
      setError(null);
      setSignedUrl(null);

      try {
        const response = await fetch(
          `/api/internal/payment-receipts/${activeReceiptId}/signed-url`
        );
        const result = (await response.json()) as SignedUrlResponse;

        if (!isActive) {
          return;
        }

        if (!response.ok || !result.ok || !result.signed_url) {
          setError(result.message ?? "No pudimos preparar el comprobante.");
          return;
        }

        setSignedUrl(result.signed_url);
      } catch {
        if (isActive) {
          setError("No pudimos preparar el comprobante.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadSignedUrl();

    return () => {
      isActive = false;
    };
  }, [receipt]);

  if (!payment || !receipt) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 px-4 py-4 backdrop-blur-md sm:items-center"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-border bg-card shadow-premium">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Comprobante de pago
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {payment.concept}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMoney(payment.amount, payment.currency)} - {payment.status_label}
            </p>
          </div>
          <button
            aria-label="Cerrar modal"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:border-primary hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="min-h-[22rem] rounded-xl border border-border bg-background/60 p-3">
            {isLoading ? (
              <div className="flex min-h-[22rem] items-center justify-center text-sm text-muted-foreground">
                Preparando comprobante...
              </div>
            ) : error ? (
              <div className="flex min-h-[22rem] items-center justify-center text-center text-sm text-danger">
                {error}
              </div>
            ) : signedUrl && isPdf(receipt.file_name) ? (
              <iframe
                className="h-[70vh] w-full rounded-lg border border-border bg-card"
                src={signedUrl}
                title={payment.concept}
              />
            ) : signedUrl && isImage(receipt.file_name) ? (
              <div
                aria-label={payment.concept}
                className="min-h-[70vh] rounded-lg border border-border bg-contain bg-center bg-no-repeat"
                role="img"
                style={{ backgroundImage: `url("${signedUrl}")` }}
              />
            ) : (
              <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                No hay vista previa disponible para este comprobante.
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Datos del comprobante
              </p>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Archivo</dt>
                  <dd className="mt-1 break-words font-semibold text-foreground">
                    {receipt.file_name ?? "Sin archivo"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Monto reportado</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatMoney(receipt.amount_reported, receipt.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Carga</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatDate(receipt.created_at)}
                  </dd>
                </div>
              </dl>

              {signedUrl ? (
                <a
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary"
                  href={signedUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Abrir/descargar
                </a>
              ) : null}
            </div>

            {receipt.client_notes ? (
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Comentario del cliente
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
                  {receipt.client_notes}
                </p>
              </div>
            ) : null}

            <PaymentStatusActions payment={payment} />
          </aside>
        </div>
      </div>
    </div>
  );
}
