import type { InternalApplicationDetail } from "@/lib/internal/queries";
import type { PaymentCommitment } from "@/lib/payments";
import { getInternalStageChecklist } from "@/lib/stages";
import type { DocumentStatus } from "@/types/database";

export type ApplicationUnifiedDocument = {
  adminNotes: string | null;
  clientNotes: string | null;
  createdAt: string;
  documentLabel: string;
  fileMimeType: string | null;
  fileName: string | null;
  fileSize: number | null;
  id: string;
  relatedTo: string;
  status: DocumentStatus;
};

export type ApplicationStageChecklistItem = {
  completed: boolean;
  detail: string;
  id: string;
  label: string;
  statusLabel: "Completo" | "Pendiente";
};

function hasValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  return Boolean(value?.trim());
}

function hasBlockingPendingPayment(payments: PaymentCommitment[]) {
  return payments.some((payment) => payment.blocks_progress && payment.status !== "paid");
}

function hasReceiptInReview(payments: PaymentCommitment[]) {
  return payments.some(
    (payment) =>
      payment.status === "in_review" ||
      payment.latest_receipt?.status === "uploaded" ||
      payment.latest_receipt?.status === "in_review"
  );
}

function resolveChecklistCompletion({
  application,
  itemId,
  payments
}: {
  application: InternalApplicationDetail;
  itemId: string;
  payments: PaymentCommitment[];
}) {
  const travelersComplete = application.travelers.length >= application.total_people;
  const hasReceivingContact = Boolean(application.receiving_contact);
  const hasDate = Boolean(application.approved_date_id || application.requested_date_id);
  const hasCoreData = [
    application.main_contact_name,
    application.origin_country,
    application.origin_city,
    application.total_people
  ].every(hasValue);
  const noBlockingPendingPayments = !hasBlockingPendingPayment(payments);
  const noReceiptsInReview = !hasReceiptInReview(payments);

  const completedById: Record<string, boolean> = {
    "active-follow-up": true,
    "application-closed": application.status === "completed",
    "arrival-confirmed": true,
    "closure-evidence": false,
    "date-base-confirmed": hasDate,
    "destination-confirmed":
      application.current_stage === "en_destino" || application.current_stage === "bienvenido",
    "destination-data-reviewed": hasReceivingContact,
    "documents-payments-reviewed": noBlockingPendingPayments,
    "final-observations": Boolean(application.notes_internal || application.requested_date_notes),
    "general-status-updated": true,
    "group-ready": travelersComplete,
    "identity-reviewed": travelersComplete,
    "internal-observations": Boolean(application.notes_internal || application.requested_date_notes),
    "internal-owner": false,
    "main-data-reviewed": hasCoreData,
    "payments-reviewed": noBlockingPendingPayments,
    "process-finished": application.current_stage === "bienvenido",
    "ready-to-close": application.current_stage === "en_destino" && noBlockingPendingPayments,
    "receipt-reviewed": noReceiptsInReview,
    "receiving-contact-confirmed": hasReceivingContact,
    "review-requested": false,
    "travelers-present": travelersComplete
  };

  return completedById[itemId] ?? false;
}

export function buildApplicationStageChecklist(
  application: InternalApplicationDetail,
  payments: PaymentCommitment[] = []
): ApplicationStageChecklistItem[] {
  return getInternalStageChecklist(application.current_stage).map((item) => {
    const completed = resolveChecklistCompletion({
      application,
      itemId: item.id,
      payments
    });

    return {
      completed,
      detail: item.detail,
      id: item.id,
      label: item.label,
      statusLabel: completed ? "Completo" : "Pendiente"
    };
  });
}
