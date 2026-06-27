import { FileText } from "lucide-react";
import { DocumentUploadForm } from "@/components/forms/DocumentUploadForm";
import { SignedDocumentButton } from "@/components/ui/SignedDocumentButton";
import type { ClientDocumentRequirement } from "@/lib/documents";
import { cn } from "@/lib/utils";

type DocumentRequirementCardProps = {
  applicationId: string;
  requirement: ClientDocumentRequirement;
};

const statusClassNames: Record<ClientDocumentRequirement["status"], string> = {
  pending: "border-border bg-background/60 text-muted-foreground",
  uploaded: "border-primary/30 bg-primary/10 text-primary",
  in_review: "border-primary/30 bg-primary/10 text-primary",
  accepted: "border-success/30 bg-success/10 text-success",
  rejected: "border-danger/30 bg-danger/10 text-danger",
  replacement_requested: "border-danger/30 bg-danger/10 text-danger"
};

function formatFileSize(value: number | null) {
  if (!value) {
    return "Sin archivo";
  }

  const megabytes = value / (1024 * 1024);

  return `${megabytes.toFixed(2)} MB`;
}

export function DocumentRequirementCard({
  applicationId,
  requirement
}: DocumentRequirementCardProps) {
  const canUpload =
    requirement.status === "pending" ||
    requirement.status === "rejected" ||
    requirement.status === "replacement_requested";
  const hasLockedDocument =
    requirement.document &&
    (requirement.status === "uploaded" ||
      requirement.status === "in_review" ||
      requirement.status === "accepted");

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">{requirement.label}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {requirement.status_description}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "w-fit rounded-full border px-3 py-1 text-xs font-semibold",
            statusClassNames[requirement.status]
          )}
        >
          {requirement.status_label}
        </span>
      </div>

      {requirement.document ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-background/60 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Archivo
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-foreground">
              {requirement.document.file_name ?? "Sin nombre"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tamano
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatFileSize(requirement.document.file_size)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <SignedDocumentButton documentId={requirement.document.id} />
          </div>
        </div>
      ) : null}

      {requirement.document?.admin_notes ? (
        <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Comentario del equipo
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-foreground">
            {requirement.document.admin_notes}
          </p>
        </div>
      ) : null}

      {hasLockedDocument ? (
        <div className="mt-4 rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-success">
            {requirement.status === "accepted"
              ? "Documento aceptado"
              : requirement.status === "in_review"
                ? "Documento en revision"
                : "Documento cargado"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            El formulario de carga se mantiene cerrado mientras el equipo revisa este
            archivo.
          </p>
        </div>
      ) : null}

      {canUpload ? (
        <DocumentUploadForm applicationId={applicationId} requirement={requirement} />
      ) : null}
    </article>
  );
}
