"use client";

import { Check, ClipboardCheck, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import type { DocumentStatus } from "@/types/database";

type InternalDocumentStatusActionsProps = {
  documentId: string;
};

type StatusResponse = {
  message?: string;
  ok: boolean;
};

const actions: {
  label: string;
  status: Extract<DocumentStatus, "accepted" | "in_review" | "rejected" | "replacement_requested">;
  icon: typeof Check;
}[] = [
  {
    label: "Marcar en revision",
    status: "in_review",
    icon: ClipboardCheck
  },
  {
    label: "Aceptar",
    status: "accepted",
    icon: Check
  },
  {
    label: "Rechazar",
    status: "rejected",
    icon: X
  },
  {
    label: "Solicitar reemplazo",
    status: "replacement_requested",
    icon: RotateCcw
  }
];

export function InternalDocumentStatusActions({
  documentId
}: InternalDocumentStatusActionsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<(typeof actions)[number]["status"]>(
    "in_review"
  );
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const needsNote =
    selectedStatus === "rejected" || selectedStatus === "replacement_requested";

  async function handleSubmit() {
    setError(null);
    setMessage(null);

    if (needsNote && !adminNotes.trim()) {
      setError("Agrega una nota para el cliente.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/internal/documents/${documentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: selectedStatus,
          admin_notes: adminNotes
        })
      });
      const result = (await response.json()) as StatusResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos actualizar el documento.");
        return;
      }

      setMessage(result.message ?? "Estado actualizado.");
      router.refresh();
    } catch {
      setError("No pudimos actualizar el documento. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Revision interna
      </p>
      <h2 className="mt-2 text-xl font-semibold text-foreground">Cambiar estado</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              selectedStatus === action.status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary"
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

      <div className="mt-5">
        <label className="text-sm font-medium text-foreground" htmlFor="admin_notes">
          Nota para el cliente
        </label>
        <textarea
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="admin_notes"
          maxLength={2000}
          onChange={(event) => setAdminNotes(event.target.value)}
          placeholder={needsNote ? "Explica que debe revisar o reemplazar." : "Opcional"}
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
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={isSubmitting}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? "Guardando..." : "Actualizar documento"}
      </button>
    </div>
  );
}
