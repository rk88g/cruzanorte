"use client";

import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { DOCUMENT_UPLOAD_MAX_SIZE_BYTES } from "@/lib/constants";
import type { ClientDocument, ClientDocumentRequirement } from "@/lib/documents";

type DocumentUploadFormProps = {
  applicationId: string;
  requirement: ClientDocumentRequirement;
};

type UploadResponse = {
  document?: ClientDocument;
  message?: string;
  ok: boolean;
};

function getActionLabel(status: ClientDocumentRequirement["status"]) {
  if (status === "pending") {
    return "Subir documento";
  }

  if (status === "rejected" || status === "replacement_requested") {
    return "Subir nueva version";
  }

  return "Documento recibido";
}

export function DocumentUploadForm({ applicationId, requirement }: DocumentUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canUpload =
    requirement.status === "pending" ||
    requirement.status === "rejected" ||
    requirement.status === "replacement_requested";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canUpload) {
      return;
    }

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
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as UploadResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos subir el documento.");
        return;
      }

      setMessage(result.message ?? "Documento recibido.");
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    } catch {
      setError("No pudimos subir el documento. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form autoComplete="off" className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <input name="application_id" type="hidden" value={applicationId} />
      <input name="document_type" type="hidden" value={requirement.document_type} />
      <input name="scope" type="hidden" value={requirement.scope} />
      <input name="traveler_id" type="hidden" value={requirement.traveler_id ?? ""} />
      <input
        name="mexico_requirement_id"
        type="hidden"
        value={requirement.mexico_requirement_id ?? ""}
      />

      <div>
        <label className="text-sm font-medium text-foreground" htmlFor={`${requirement.key}-file`}>
          Archivo
        </label>
        <input
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
          disabled={!canUpload || isSubmitting}
          id={`${requirement.key}-file`}
          name="file"
          ref={fileInputRef}
          type="file"
        />
      </div>

      <div>
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={`${requirement.key}-client-notes`}
        >
          Comentario para el equipo
        </label>
        <textarea
          className="mt-2 min-h-20 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          disabled={!canUpload || isSubmitting}
          id={`${requirement.key}-client-notes`}
          maxLength={2000}
          name="client_notes"
          placeholder="Opcional"
        />
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}

      <button
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={!canUpload || isSubmitting}
        type="submit"
      >
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Subiendo..." : getActionLabel(requirement.status)}
      </button>
    </form>
  );
}
