"use client";

type PaymentReceiptUploadFormProps = {
  disabledReason?: string;
};

export function PaymentReceiptUploadForm({
  disabledReason = "Carga de comprobante proximamente"
}: PaymentReceiptUploadFormProps) {
  return (
    <button
      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      disabled
      type="button"
    >
      {disabledReason}
    </button>
  );
}
