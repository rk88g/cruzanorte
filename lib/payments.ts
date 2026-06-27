import {
  PAYMENT_SCOPE_LABELS,
  PAYMENT_STATUS_LABELS
} from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  InternalPaymentCreateData,
  InternalPaymentStatusUpdateData
} from "@/validations/payment";
import type { PaymentReceiptRow, PaymentRow, TravelerRow } from "@/types/database";

const PAYMENT_SELECT =
  "id, application_id, client_id, traveler_id, mexico_requirement_id, stage, concept, description, amount, currency, payment_type, payment_scope, percentage, due_date, status, blocks_progress, is_extra_payment, is_financed, financing_months, promotion_name, discount_amount, discount_percentage, created_by, created_at, updated_at";

const PAYMENT_RECEIPT_SELECT =
  "id, payment_id, application_id, traveler_id, file_path, file_name, amount_reported, currency, status, admin_notes, client_notes, uploaded_by, reviewed_by, created_at, reviewed_at";

type PaymentRecord = Omit<PaymentRow, "payment_method" | "payment_provider" | "provider_reference">;

export type PaymentReceiptSummary = Pick<
  PaymentReceiptRow,
  | "amount_reported"
  | "admin_notes"
  | "client_notes"
  | "created_at"
  | "currency"
  | "file_name"
  | "file_path"
  | "id"
  | "reviewed_at"
  | "status"
>;

export type PaymentCommitment = Pick<
  PaymentRow,
  | "amount"
  | "application_id"
  | "blocks_progress"
  | "client_id"
  | "concept"
  | "currency"
  | "description"
  | "discount_amount"
  | "discount_percentage"
  | "due_date"
  | "financing_months"
  | "id"
  | "is_extra_payment"
  | "is_financed"
  | "payment_scope"
  | "promotion_name"
  | "stage"
  | "status"
  | "traveler_id"
> & {
  latest_receipt: PaymentReceiptSummary | null;
  scope_label: string;
  status_label: string;
  traveler: Pick<TravelerRow, "full_name" | "id"> | null;
};

export type CreatePaymentResult =
  | {
      message: string;
      payment: PaymentCommitment;
      status: "created";
    }
  | {
      message: string;
      status: "not_found" | "not_allowed";
    };

export type UpdatePaymentStatusResult =
  | {
      message: string;
      status: "updated";
    }
  | {
      message: string;
      status: "not_found";
    };

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function toPaymentCommitment({
  payment,
  receipt,
  traveler
}: {
  payment: PaymentRecord;
  receipt: PaymentReceiptRow | null;
  traveler: Pick<TravelerRow, "full_name" | "id"> | null;
}): PaymentCommitment {
  return {
    amount: toNumber(payment.amount),
    application_id: payment.application_id,
    blocks_progress: payment.blocks_progress,
    client_id: payment.client_id,
    concept: payment.concept,
    currency: payment.currency,
    description: payment.description,
    discount_amount: toNumber(payment.discount_amount),
    discount_percentage:
      payment.discount_percentage === null ? null : toNumber(payment.discount_percentage),
    due_date: payment.due_date,
    financing_months: payment.financing_months,
    id: payment.id,
    is_extra_payment: payment.is_extra_payment,
    is_financed: payment.is_financed,
    latest_receipt: receipt
      ? {
          amount_reported:
            receipt.amount_reported === null ? null : toNumber(receipt.amount_reported),
          admin_notes: receipt.admin_notes,
          client_notes: receipt.client_notes,
          created_at: receipt.created_at,
          currency: receipt.currency,
          file_name: receipt.file_name,
          file_path: receipt.file_path,
          id: receipt.id,
          reviewed_at: receipt.reviewed_at,
          status: receipt.status
        }
      : null,
    payment_scope: payment.payment_scope,
    promotion_name: payment.promotion_name,
    scope_label: PAYMENT_SCOPE_LABELS[payment.payment_scope],
    stage: payment.stage,
    status: payment.status,
    status_label: PAYMENT_STATUS_LABELS[payment.status],
    traveler,
    traveler_id: payment.traveler_id
  };
}

async function getTravelersById(travelerIds: string[]) {
  const uniqueIds = [...new Set(travelerIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map<string, Pick<TravelerRow, "full_name" | "id">>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("travelers")
    .select("id, full_name")
    .in("id", uniqueIds);

  if (error) {
    throw new Error("Could not read payment travelers.");
  }

  return new Map((data ?? []).map((traveler) => [traveler.id, traveler]));
}

async function getLatestReceiptsByPaymentId(paymentIds: string[]) {
  if (paymentIds.length === 0) {
    return new Map<string, PaymentReceiptRow>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payment_receipts")
    .select(PAYMENT_RECEIPT_SELECT)
    .in("payment_id", paymentIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not read payment receipts.");
  }

  const receiptsByPaymentId = new Map<string, PaymentReceiptRow>();

  for (const receipt of data ?? []) {
    if (!receiptsByPaymentId.has(receipt.payment_id)) {
      receiptsByPaymentId.set(receipt.payment_id, receipt);
    }
  }

  return receiptsByPaymentId;
}

async function hydratePayments(payments: PaymentRecord[]) {
  const [travelersById, receiptsByPaymentId] = await Promise.all([
    getTravelersById(payments.map((payment) => payment.traveler_id ?? "")),
    getLatestReceiptsByPaymentId(payments.map((payment) => payment.id))
  ]);

  return payments.map((payment) =>
    toPaymentCommitment({
      payment,
      receipt: receiptsByPaymentId.get(payment.id) ?? null,
      traveler: payment.traveler_id ? travelersById.get(payment.traveler_id) ?? null : null
    })
  );
}

export async function getPaymentsForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Could not read payments.");
  }

  return hydratePayments(data ?? []);
}

export async function getClientPaymentsForApplication(clientId: string, applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("application_id", applicationId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Could not read client payments.");
  }

  return hydratePayments(data ?? []);
}

export function hasBlockingPendingPayments(payments: PaymentCommitment[]) {
  return payments.some((payment) => payment.blocks_progress && payment.status !== "paid");
}

export async function createInternalPayment(
  applicationId: string,
  input: InternalPaymentCreateData
): Promise<CreatePaymentResult> {
  const supabase = createSupabaseAdminClient();
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, client_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError) {
    throw new Error("Could not read application for payment.");
  }

  if (!application) {
    return {
      status: "not_found",
      message: "No encontramos la solicitud."
    };
  }

  if (input.traveler_id) {
    const { data: traveler, error: travelerError } = await supabase
      .from("travelers")
      .select("id")
      .eq("id", input.traveler_id)
      .eq("application_id", applicationId)
      .maybeSingle();

    if (travelerError) {
      throw new Error("Could not validate payment traveler.");
    }

    if (!traveler) {
      return {
        status: "not_allowed",
        message: "La persona seleccionada no pertenece a esta solicitud."
      };
    }
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      amount: input.amount,
      application_id: applicationId,
      blocks_progress: input.blocks_progress,
      client_id: application.client_id,
      concept: input.concept,
      currency: input.currency.toUpperCase(),
      description: input.description ?? null,
      discount_amount: input.discount_amount ?? 0,
      discount_percentage: input.discount_percentage ?? null,
      due_date: input.due_date ?? null,
      financing_months: input.is_financed ? input.financing_months ?? null : null,
      is_extra_payment: input.is_extra_payment,
      is_financed: input.is_financed,
      payment_scope: input.payment_scope,
      payment_type: "fixed",
      promotion_name: input.promotion_name ?? null,
      stage: input.stage,
      status: input.status,
      traveler_id: input.traveler_id ?? null
    })
    .select(PAYMENT_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Could not create payment.");
  }

  const [payment] = await hydratePayments([data]);

  return {
    status: "created",
    message: "Compromiso de pago creado.",
    payment
  };
}

export async function updateInternalPaymentStatus(
  paymentId: string,
  input: InternalPaymentStatusUpdateData
): Promise<UpdatePaymentStatusResult> {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: readError } = await supabase
    .from("payments")
    .select("id")
    .eq("id", paymentId)
    .maybeSingle();

  if (readError) {
    throw new Error("Could not read payment.");
  }

  if (!payment) {
    return {
      status: "not_found",
      message: "No encontramos el compromiso de pago."
    };
  }

  const { error } = await supabase
    .from("payments")
    .update({
      status: input.status,
      updated_at: new Date().toISOString()
    })
    .eq("id", paymentId);

  if (error) {
    throw new Error("Could not update payment status.");
  }

  if (input.receipt_id) {
    const receiptUpdate =
      input.status === "paid"
        ? {
            admin_notes: input.admin_notes ?? null,
            reviewed_at: new Date().toISOString(),
            status: "accepted" as const
          }
        : input.status === "in_review"
          ? {
              admin_notes: input.admin_notes ?? null,
              status: "in_review" as const
            }
          : input.status === "rejected"
            ? {
                admin_notes: input.admin_notes ?? null,
                reviewed_at: new Date().toISOString(),
                status: "rejected" as const
              }
            : input.status === "partial"
              ? {
                  admin_notes: input.admin_notes ?? null,
                  amount_reported: input.amount_reported ?? null,
                  reviewed_at: new Date().toISOString(),
                  status: "accepted" as const
                }
              : null;

    if (receiptUpdate) {
      const { error: receiptError } = await supabase
        .from("payment_receipts")
        .update(receiptUpdate)
        .eq("id", input.receipt_id)
        .eq("payment_id", paymentId);

      if (receiptError) {
        throw new Error("Could not update payment receipt status.");
      }
    }
  }

  return {
    status: "updated",
    message: "Estado del pago actualizado."
  };
}
