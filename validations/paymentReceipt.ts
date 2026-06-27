import { z } from "zod";

const reviewStatuses = ["in_review", "paid", "partial", "rejected", "cancelled"] as const;

const emptyValueToUndefined = (value: unknown) => {
  if (value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalNotesSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
);

export const paymentReceiptUploadSchema = z.object({
  amount_reported: z.preprocess(
    emptyValueToUndefined,
    z.coerce.number().positive("Ingresa un monto valido.").optional()
  ),
  client_notes: optionalNotesSchema
});

export const paymentReceiptReviewSchema = z
  .object({
    admin_notes: optionalNotesSchema,
    amount_reported: z.preprocess(
      emptyValueToUndefined,
      z.coerce.number().positive("Ingresa un monto valido.").optional()
    ),
    receipt_id: z.preprocess(
      emptyValueToUndefined,
      z.string().uuid("Comprobante invalido.").optional()
    ),
    status: z.enum(reviewStatuses, {
      errorMap: () => ({ message: "Selecciona un estado valido." })
    })
  })
  .superRefine((value, context) => {
    if (value.status === "rejected" && !value.admin_notes) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agrega una nota para rechazar el comprobante.",
        path: ["admin_notes"]
      });
    }
  });

export type PaymentReceiptUploadData = z.output<typeof paymentReceiptUploadSchema>;
export type PaymentReceiptReviewData = z.output<typeof paymentReceiptReviewSchema>;
