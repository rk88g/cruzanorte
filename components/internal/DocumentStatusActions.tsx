"use client";

import { Check, ClipboardCheck, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import type { DocumentStatus } from "@/types/database";

type DocumentStatusActionsProps = {
  documentId: string;
  initialAdminNotes: string | null;
  onUpdated?: () => void;
};

type StatusResponse = {
  message?: string;
  ok: boolean;
};

const actions: {
  icon: typeof Check;
  label: string;
  status: Extract<DocumentStatus, "accepted" | "in_review" | "rejected" | "replacement_requested">;
}[] = [
  {
    icon: ClipboardCheck,
    label: "Marcar en revision",
    status: "in_review"
  },
  {
    icon: Check,
    label: "Aceptar",
    status: "accepted"
  },
  {
    icon: X,
    label: "Rechazar",
    status: "rejected"
  },
  {
    icon: RotateCcw,
    label: "Solicitar reemplazo",
    status: "replacement_requested"
  }
];

export function DocumentStatusActions({
  documentId,
  initialAdminNotes,
  onUpdated
}: DocumentStatusActionsProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<(typeof actions)[number]["status"]>(
    "in_review"
  );
  const [adminNotes, setAdminNotes] = useState(initialAdminNotes ?? "");
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
          admin_notes: adminNotes,
          status: selectedStatus
        })
      });
      const result = (await response.json()) as StatusResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos actualizar el documento.");
        return;
      }

      setMessage(result.message ?? "Estado actualizado.");
      router.refresh();
      onUpdated?.();
    } catch {
      setError("No pudimos actualizar el documento. Intenta nuevamente.");
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

      <div className="mt-4">
        <label className="text-sm font-medium text-foreground" htmlFor="document-admin-notes">
          Nota visible para cliente
        </label>
        <textarea
          autoComplete="off"
          className="mt-2 min-h-24 w-full resize-y rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          id="document-admin-notes"
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
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={isSubmitting}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? "Guardando..." : "Actualizar documento"}
      </button>
    </div>
  );
}
