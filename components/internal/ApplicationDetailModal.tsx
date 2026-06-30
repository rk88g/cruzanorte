"use client";

import { PaymentStatusActions } from "@/components/internal/PaymentStatusActions";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ApplicationCardItem } from "@/lib/internal/applicationCards";

type ApplicationDetailModalProps = {
  card: ApplicationCardItem | null;
  onClose: () => void;
};

function getPriorityTone(priority: ApplicationCardItem["priority"]) {
  if (priority === "Alta") {
    return "danger" as const;
  }

  if (priority === "Media") {
    return "primary" as const;
  }

  return "default" as const;
}

function getStatusTone(status: string) {
  if (
    status.includes("Rechazado") ||
    status.includes("Reemplazo") ||
    status.includes("Requiere") ||
    status.includes("Vencido")
  ) {
    return "danger" as const;
  }

  if (status.includes("Completo") || status.includes("Aceptado") || status.includes("Pagado")) {
    return "success" as const;
  }

  if (status.includes("Pendiente") || status.includes("Solicitado")) {
    return "primary" as const;
  }

  return "default" as const;
}

export function ApplicationDetailModal({ card, onClose }: ApplicationDetailModalProps) {
  if (!card) {
    return null;
  }

  return (
    <Modal
      eyebrow={card.identifier}
      onClose={onClose}
      subtitle={card.subtitle}
      title={card.title}
    >
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone={getStatusTone(card.status)} value={card.status} />
        <StatusBadge tone={getPriorityTone(card.priority)} value={`Prioridad ${card.priority}`} />
        <StatusBadge value={card.responsible} />
      </div>

      <p className="mt-5 rounded-xl border border-border bg-background/60 p-4 text-sm font-semibold text-foreground">
        {card.primaryDetail}
      </p>

      {card.secondaryDetails.length > 0 ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {card.secondaryDetails.map((detail) => (
            <div className="rounded-xl border border-border bg-background/60 p-4" key={detail.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {detail.label}
              </dt>
              <dd className="mt-2 whitespace-pre-line break-words text-sm font-semibold text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {card.payment ? (
        <div className="mt-5">
          <PaymentStatusActions payment={card.payment} />
        </div>
      ) : null}
    </Modal>
  );
}
