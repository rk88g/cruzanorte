"use client";

import { Download, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DocumentStatusActions } from "@/components/internal/DocumentStatusActions";
import { DOCUMENT_STATUS_LABELS } from "@/lib/constants";
import type { ApplicationUnifiedDocument } from "@/lib/internal/applicationDetail";

type DocumentPreviewModalProps = {
  document: ApplicationUnifiedDocument | null;
  onClose: () => void;
};

type SignedUrlResponse = {
  message?: string;
  ok: boolean;
  signed_url?: string;
};

function formatFileSize(value: number | null) {
  if (!value) {
    return "Sin dato";
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) {
      return;
    }

    let isActive = true;
    const activeDocument = document;

    async function loadSignedUrl() {
      setIsLoading(true);
      setError(null);
      setSignedUrl(null);

      try {
        const response = await fetch(`/api/internal/documents/${activeDocument.id}/signed-url`);
        const result = (await response.json()) as SignedUrlResponse;

        if (!isActive) {
          return;
        }

        if (!response.ok || !result.ok || !result.signed_url) {
          setError(result.message ?? "No pudimos preparar el archivo.");
          return;
        }

        setSignedUrl(result.signed_url);
      } catch {
        if (isActive) {
          setError("No pudimos preparar el archivo.");
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
  }, [document]);

  if (!document) {
    return null;
  }

  const isImage = Boolean(document.fileMimeType?.startsWith("image/"));
  const isPdf = document.fileMimeType === "application/pdf";

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
              Documento
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {document.documentLabel}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{document.relatedTo}</p>
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
                Preparando vista del archivo...
              </div>
            ) : error ? (
              <div className="flex min-h-[22rem] items-center justify-center text-center text-sm text-danger">
                {error}
              </div>
            ) : signedUrl && isPdf ? (
              <iframe
                className="h-[70vh] w-full rounded-lg border border-border bg-card"
                src={signedUrl}
                title={document.documentLabel}
              />
            ) : signedUrl && isImage ? (
              <div
                aria-label={document.documentLabel}
                className="min-h-[70vh] rounded-lg border border-border bg-contain bg-center bg-no-repeat"
                role="img"
                style={{ backgroundImage: `url("${signedUrl}")` }}
              />
            ) : (
              <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                No hay vista previa disponible para este archivo.
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Archivo
              </p>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nombre</dt>
                  <dd className="mt-1 break-words font-semibold text-foreground">
                    {document.fileName ?? "Sin nombre"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Estado</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {DOCUMENT_STATUS_LABELS[document.status]}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tamano</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatFileSize(document.fileSize)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Carga</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {formatDate(document.createdAt)}
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

            {document.clientNotes ? (
              <div className="rounded-xl border border-border bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Comentario del cliente
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
                  {document.clientNotes}
                </p>
              </div>
            ) : null}

            <DocumentStatusActions
              documentId={document.id}
              initialAdminNotes={document.adminNotes}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
