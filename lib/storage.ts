import {
  DOCUMENT_UPLOAD_BUCKET,
  PAYMENT_RECEIPT_UPLOAD_BUCKET
} from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function sanitizeStorageFileName(fileName: string) {
  const [name = "documento", ...extensionParts] = fileName.split(".");
  const extension = extensionParts.length > 0 ? `.${extensionParts.pop()}` : "";
  const safeName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const safeExtension = extension.replace(/[^a-zA-Z0-9.]/g, "").slice(0, 12);

  return `${safeName || "documento"}${safeExtension.toLowerCase()}`;
}

export async function uploadPrivateDocumentFile({
  contentType,
  file,
  filePath
}: {
  contentType: string;
  file: ArrayBuffer;
  filePath: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(DOCUMENT_UPLOAD_BUCKET)
    .upload(filePath, file, {
      contentType,
      upsert: false
    });

  if (error) {
    throw new Error("Could not upload document file.");
  }
}

export async function createDocumentSignedUrl(filePath: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENT_UPLOAD_BUCKET)
    .createSignedUrl(filePath, 60 * 5);

  if (error || !data?.signedUrl) {
    throw new Error("Could not create signed document URL.");
  }

  return data.signedUrl;
}

export async function uploadPrivatePaymentReceiptFile({
  contentType,
  file,
  filePath
}: {
  contentType: string;
  file: ArrayBuffer;
  filePath: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(PAYMENT_RECEIPT_UPLOAD_BUCKET)
    .upload(filePath, file, {
      contentType,
      upsert: false
    });

  if (error) {
    throw new Error("Could not upload payment receipt file.");
  }
}

export async function createPaymentReceiptSignedUrl(filePath: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PAYMENT_RECEIPT_UPLOAD_BUCKET)
    .createSignedUrl(filePath, 60 * 5);

  if (error || !data?.signedUrl) {
    throw new Error("Could not create signed payment receipt URL.");
  }

  return data.signedUrl;
}
