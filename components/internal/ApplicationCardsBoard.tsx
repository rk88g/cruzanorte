"use client";

import { useMemo, useState } from "react";
import { ApplicationCardGroup } from "@/components/internal/ApplicationCardGroup";
import { ApplicationDetailModal } from "@/components/internal/ApplicationDetailModal";
import { DocumentPreviewModal } from "@/components/internal/DocumentPreviewModal";
import { PaymentReceiptModal } from "@/components/internal/PaymentReceiptModal";
import type {
  ApplicationCardFilter,
  ApplicationCardGroup as ApplicationCardGroupData,
  ApplicationCardItem,
  ApplicationCardsBoardData
} from "@/lib/internal/applicationCards";
import type { ApplicationUnifiedDocument } from "@/lib/internal/applicationDetail";
import type { PaymentCommitment } from "@/lib/payments";
import { cn } from "@/lib/utils";

type ApplicationCardsBoardProps = {
  board: ApplicationCardsBoardData;
};

function matchesFilter(card: ApplicationCardItem, filter: ApplicationCardFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "pending") {
    return (
      card.priority === "Alta" ||
      ["Pendiente", "Rechazado", "Reemplazo solicitado", "Solicitado", "Vencido"].includes(
        card.status
      )
    );
  }

  if (filter === "client") {
    return card.responsible === "Cliente";
  }

  if (filter === "internal") {
    return card.responsible === "Interno";
  }

  if (filter === "documents") {
    return card.group === "documents";
  }

  if (filter === "payments") {
    return card.group === "payments";
  }

  return card.group === "stage";
}

function filterGroups(groups: ApplicationCardGroupData[], filter: ApplicationCardFilter) {
  return groups
    .map((group) => ({
      ...group,
      countLabel: `${group.items.filter((item) => matchesFilter(item, filter)).length} ${
        group.items.filter((item) => matchesFilter(item, filter)).length === 1
          ? "elemento"
          : "elementos"
      }`,
      items: group.items.filter((item) => matchesFilter(item, filter))
    }))
    .filter((group) => group.items.length > 0);
}

export function ApplicationCardsBoard({ board }: ApplicationCardsBoardProps) {
  const [activeFilter, setActiveFilter] = useState<ApplicationCardFilter>("all");
  const [selectedDetail, setSelectedDetail] = useState<ApplicationCardItem | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ApplicationUnifiedDocument | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentCommitment | null>(
    null
  );
  const visibleGroups = useMemo(
    () => filterGroups(board.groups, activeFilter),
    [activeFilter, board.groups]
  );

  function handleAction(card: ApplicationCardItem) {
    if (card.actionType === "view_document" && card.document) {
      setSelectedDocument(card.document);
      return;
    }

    if (card.actionType === "view_receipt" && card.payment?.latest_receipt) {
      setSelectedReceiptPayment(card.payment);
      return;
    }

    setSelectedDetail(card);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Filtros rapidos
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {board.filters.map((filter) => (
            <button
              className={cn(
                "min-h-10 rounded-lg border px-4 py-2 text-sm font-semibold transition",
                activeFilter === filter.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
              )}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {visibleGroups.map((group) => (
        <ApplicationCardGroup group={group} key={group.id} onAction={handleAction} />
      ))}

      {visibleGroups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
          <p className="text-sm font-semibold text-foreground">No hay tarjetas para este filtro.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cambia el filtro para ver mas informacion de la solicitud.
          </p>
        </div>
      ) : null}

      <ApplicationDetailModal
        card={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
      <DocumentPreviewModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
      <PaymentReceiptModal
        onClose={() => setSelectedReceiptPayment(null)}
        payment={selectedReceiptPayment}
      />
    </section>
  );
}
