import { Eye, FileText, Plus } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ApplicationCardGroup as ApplicationCardGroupData, ApplicationCardItem } from "@/lib/internal/applicationCards";
import { cn } from "@/lib/utils";

type ApplicationCardGroupProps = {
  group: ApplicationCardGroupData;
  onAction: (card: ApplicationCardItem) => void;
  onCreatePayment?: () => void;
};

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

  if (status.includes("Pendiente") || status.includes("Solicitado") || status.includes("En revision")) {
    return "primary" as const;
  }

  return "default" as const;
}

function getPriorityTone(priority: ApplicationCardItem["priority"]) {
  if (priority === "Alta") {
    return "danger" as const;
  }

  if (priority === "Media") {
    return "primary" as const;
  }

  return "default" as const;
}

function ActionIcon({ actionType }: { actionType: ApplicationCardItem["actionType"] }) {
  if (actionType === "view_document" || actionType === "view_receipt") {
    return <FileText className="h-4 w-4" aria-hidden="true" />;
  }

  return <Eye className="h-4 w-4" aria-hidden="true" />;
}

export function ApplicationCardGroup({
  group,
  onAction,
  onCreatePayment
}: ApplicationCardGroupProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {group.countLabel}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">{group.title}</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            {group.summary}
          </span>
          {onCreatePayment ? (
            <ActionButton
              className="min-h-9 px-3 py-1.5"
              icon={<Plus className="h-4 w-4" aria-hidden="true" />}
              onClick={onCreatePayment}
              variant="primary"
            >
              Crear compromiso de pago
            </ActionButton>
          ) : null}
        </div>
      </div>

      {group.items.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {group.items.map((card) => (
          <article
            className={cn(
              "flex min-h-64 flex-col rounded-xl border bg-background/60 p-4 shadow-soft",
              card.priority === "Alta" ? "border-danger/30" : "border-border"
            )}
            key={card.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {card.identifier}
                </span>
                <h3 className="mt-3 break-words text-base font-semibold text-foreground">
                  {card.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.subtitle}</p>
              </div>
              <StatusBadge tone={getStatusTone(card.status)} value={card.status} />
            </div>

            <p className="mt-4 break-words rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground">
              {card.primaryDetail}
            </p>

            <dl className="mt-4 grid gap-2 text-sm">
              {card.secondaryDetails.slice(0, 3).map((detail) => (
                <div className="flex gap-2" key={detail.label}>
                  <dt className="min-w-24 shrink-0 text-muted-foreground">{detail.label}</dt>
                  <dd className="min-w-0 break-words font-medium text-foreground">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto pt-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge tone={getPriorityTone(card.priority)} value={card.priority} />
                <StatusBadge value={card.responsible} />
              </div>
              {card.actionType === "none" || card.actionType === "upcoming" ? (
                <ActionButton disabled>{card.actionLabel}</ActionButton>
              ) : (
                <ActionButton
                  icon={<ActionIcon actionType={card.actionType} />}
                  onClick={() => onAction(card)}
                >
                  {card.actionLabel}
                </ActionButton>
              )}
            </div>
          </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-border bg-background/60 p-5 text-sm text-muted-foreground">
          Aun no hay compromisos de pago registrados para esta solicitud.
        </div>
      )}
    </section>
  );
}
