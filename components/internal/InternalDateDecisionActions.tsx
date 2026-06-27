"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import type { RequestedDateStatus } from "@/types/database";

type InternalDateDecisionActionsProps = {
  applicationId: string;
  requestedDateStatus: RequestedDateStatus;
};

type DecisionResponse = {
  message?: string;
  ok: boolean;
};

export function InternalDateDecisionActions({
  applicationId,
  requestedDateStatus
}: InternalDateDecisionActionsProps) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canDecide = requestedDateStatus === "requested";

  async function submitDecision(nextAction: "approve" | "reject") {
    setAction(nextAction);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(
        `/api/internal/applications/${applicationId}/${
          nextAction === "approve" ? "approve-date" : "reject-date"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({})
        }
      );
      const result = (await response.json()) as DecisionResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "No pudimos actualizar la solicitud.");
        return;
      }

      setMessage(result.message ?? "Solicitud actualizada.");
      router.refresh();
    } catch {
      setError("No pudimos actualizar la solicitud. Intenta nuevamente.");
    } finally {
      setAction(null);
    }
  }

  if (!canDecide) {
    return (
      <p className="text-xs text-muted-foreground">
        Sin acciones disponibles para este estado.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(action)}
          onClick={() => submitDecision("approve")}
          type="button"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {action === "approve" ? "Autorizando..." : "Autorizar"}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(action)}
          onClick={() => submitDecision("reject")}
          type="button"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {action === "reject" ? "Rechazando..." : "Rechazar"}
        </button>
      </div>
    </div>
  );
}
