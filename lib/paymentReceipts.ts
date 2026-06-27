import {
  DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES,
  DOCUMENT_UPLOAD_MAX_SIZE_BYTES
} from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createPaymentReceiptSignedUrl,
  sanitizeStorageFileName,
  uploadPrivatePaymentReceiptFile
} from "@/lib/storage";
import type { PaymentReceiptUploadData } from "@/validations/paymentReceipt";
import type { PaymentReceiptRow, PaymentRow } from "@/types/database";

const PAYMENT_SELECT =
  "id, application_id, client_id, traveler_id, status, currency";

const PAYMENT_RECEIPT_SELECT =
  "id, payment_id, application_id, traveler_id, file_path, file_name, amount_reported, currency, status, admin_notes, client_notes, uploaded_by, reviewed_by, created_at, reviewed_at";

export type PaymentReceiptUploadResult =
  | {
      message: string;
      receipt: Pick<
        PaymentReceiptRow,
        "created_at" | "file_name" | "id" | "status"
      >;
      status: "uploaded";
    }
  | {
      message: string;
      status: "file_invalid" | "not_allowed" | "not_found";
    };

function validateReceiptFile(file: File) {
  if (!file || file.size === 0) {
    return "Selecciona un archivo.";
  }

  if (file.size > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
    return "El archivo no debe superar 10 MB.";
  }

  if (![...DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES].includes(file.type as never)) {
    return "Solo puedes subir PDF, JPG, JPEG, PNG o WEBP.";
  }

  return null;
}

function buildReceiptFilePath({
  applicationId,
  fileName,
  paymentId
}: {
  applicationId: string;
  fileName: string;
  paymentId: string;
}) {
  const timestamp = Date.now();
  const safeFileName = sanitizeStorageFileName(fileName);

  return `applications/${applicationId}/payments/${paymentId}/${timestamp}-${safeFileName}`;
}

async function getLatestReceipt(paymentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payment_receipts")
    .select(PAYMENT_RECEIPT_SELECT)
    .eq("payment_id", paymentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read latest payment receipt.");
  }

  return data;
}

function canUploadReceipt(payment: Pick<PaymentRow, "status">, receipt: PaymentReceiptRow | null) {
  if (payment.status === "paid" || payment.status === "cancelled" || payment.status === "partial") {
    return false;
  }

  if (!receipt) {
    return payment.status === "pending" || payment.status === "requested" || payment.status === "rejected";
  }

  return receipt.status === "rejected" || receipt.status === "replacement_requested";
}

export async function uploadPaymentReceiptForClient(
  clientId: string,
  paymentId: string,
  input: PaymentReceiptUploadData,
  file: File
): Promise<PaymentReceiptUploadResult> {
  const fileError = validateReceiptFile(file);

  if (fileError) {
    return {
      status: "file_invalid",
      message: fileError
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select(PAYMENT_SELECT)
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError) {
    throw new Error("Could not read payment.");
  }

  if (!payment) {
    return {
      status: "not_found",
      message: "No encontramos el compromiso de pago."
    };
  }

  if (payment.client_id !== clientId) {
    return {
      status: "not_allowed",
      message: "Este compromiso de pago no pertenece a tu solicitud."
    };
  }

  const latestReceipt = await getLatestReceipt(payment.id);

  if (!canUploadReceipt(payment, latestReceipt)) {
    return {
      status: "not_allowed",
      message:
        "Este compromiso ya tiene un comprobante activo o no permite nuevas cargas en este momento."
    };
  }

  const filePath = buildReceiptFilePath({
    applicationId: payment.application_id,
    fileName: file.name,
    paymentId: payment.id
  });
  const fileBuffer = await file.arrayBuffer();

  await uploadPrivatePaymentReceiptFile({
    contentType: file.type,
    file: fileBuffer,
    filePath
  });

  const { data: receipt, error: receiptError } = await supabase
    .from("payment_receipts")
    .insert({
      amount_reported: input.amount_reported ?? null,
      application_id: payment.application_id,
      client_notes: input.client_notes ?? null,
      currency: payment.currency,
      file_name: file.name,
      file_path: filePath,
      payment_id: payment.id,
      status: "uploaded",
      traveler_id: payment.traveler_id,
      uploaded_by: clientId
    })
    .select(PAYMENT_RECEIPT_SELECT)
    .single();

  if (receiptError || !receipt) {
    throw new Error("Could not save payment receipt.");
  }

  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({
      status: "in_review",
      updated_at: new Date().toISOString()
    })
    .eq("id", payment.id);

  if (paymentUpdateError) {
    throw new Error("Could not update payment status after receipt upload.");
  }

  return {
    status: "uploaded",
    message: "Comprobante recibido. Esta en revision.",
    receipt: {
      created_at: receipt.created_at,
      file_name: receipt.file_name,
      id: receipt.id,
      status: receipt.status
    }
  };
}

export async function createInternalPaymentReceiptSignedUrl(receiptId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: receipt, error } = await supabase
    .from("payment_receipts")
    .select(PAYMENT_RECEIPT_SELECT)
    .eq("id", receiptId)
    .maybeSingle();

  if (error || !receipt?.file_path) {
    return null;
  }

  return createPaymentReceiptSignedUrl(receipt.file_path);
}
