"use client";

import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { DOCUMENT_UPLOAD_MAX_SIZE_BYTES } from "@/lib/constants";

type PaymentReceiptUploadFormProps = {
  defaultAmount?: number;
  label?: string;
  paymentId: string;
};

type UploadResponse = {
  message?: string;
  ok: boolean;
};

export function PaymentReceiptUploadForm({
  defaultAmount,
  label = "Subir comprobante",
  paymentId
}: PaymentReceiptUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("Selecciona un archivo.");
      setIsSubmitting(false);
      return;
    }

    if (file.size > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
      setError("El archivo no debe superar 10 MB.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/payments/${paymentId}/receipt`, {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos subir el comprobante.");
        return;
      }

      setMessage(result.message ?? "Comprobante recibido. Esta en revision.");
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch {
      setError("No pudimos subir el comprobante. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form autoComplete="off" className="w-full space-y-3 sm:max-w-sm" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor={`${paymentId}-receipt`}>
          Comprobante
        </label>
        <input
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-soft file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
          disabled={isSubmitting}
          id={`${paymentId}-receipt`}
          name="file"
          ref={fileInputRef}
          required
          type="file"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground" htmlFor={`${paymentId}-amount`}>
          Monto reportado
        </label>
        <input
          className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          defaultValue={defaultAmount}
          disabled={isSubmitting}
          id={`${paymentId}-amount`}
          min="0"
          name="amount_reported"
          step="0.01"
          type="number"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground" htmlFor={`${paymentId}-notes`}>
          Comentario opcional
        </label>
        <textarea
          className="mt-2 min-h-20 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          disabled={isSubmitting}
          id={`${paymentId}-notes`}
          maxLength={2000}
          name="client_notes"
          placeholder="Referencia o comentario para el equipo"
        />
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}

      <button
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Subiendo..." : label}
      </button>
    </form>
  );
}
