"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

type SignedDocumentButtonProps = {
  documentId: string;
  label?: string;
};

type SignedUrlResponse = {
  message?: string;
  ok: boolean;
  signed_url?: string;
};

export function SignedDocumentButton({
  documentId,
  label = "Ver archivo"
}: SignedDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/signed-url`);
      const result = (await response.json()) as SignedUrlResponse;

      if (!response.ok || !result.ok || !result.signed_url) {
        setError(result.message ?? "No pudimos abrir el archivo.");
        return;
      }

      window.open(result.signed_url, "_blank", "noopener,noreferrer");
    } catch {
      setError("No pudimos abrir el archivo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isLoading}
        onClick={handleOpen}
        type="button"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        {isLoading ? "Preparando..." : label}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
