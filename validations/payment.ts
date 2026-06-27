import { z } from "zod";
import {
  APPLICATION_STAGES,
  PAYMENT_SCOPES,
  PAYMENT_STATUSES
} from "@/lib/constants";
import type { ApplicationStage, PaymentScope, PaymentStatus } from "@/types/database";

const stageValues = APPLICATION_STAGES.map((stage) => stage.slug) as [
  ApplicationStage,
  ...ApplicationStage[]
];

const paymentScopeValues = PAYMENT_SCOPES.filter(
  (scope) => scope !== "mexico_entry_requirement"
) as [PaymentScope, ...PaymentScope[]];
const paymentStatusValues = PAYMENT_STATUSES as unknown as [
  PaymentStatus,
  ...PaymentStatus[]
];

const emptyValueToUndefined = (value: unknown) => {
  if (value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalUuidSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().uuid("Identificador invalido.").optional()
);

const optionalTextSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
);

const optionalShortTextSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().trim().max(120, "Usa maximo 120 caracteres.").optional()
);

const optionalNumberSchema = z.preprocess(
  emptyValueToUndefined,
  z.coerce.number().min(0, "Usa un monto valido.").optional()
);

export const internalPaymentCreateSchema = z
  .object({
    amount: z.coerce.number().positive("Ingresa un monto mayor a cero."),
    blocks_progress: z.coerce.boolean().default(false),
    concept: z.string().trim().min(2, "Ingresa el concepto.").max(160),
    currency: z.string().trim().min(3).max(3).default("MXN"),
    description: optionalTextSchema,
    discount_amount: optionalNumberSchema.default(0),
    discount_percentage: optionalNumberSchema,
    due_date: z.preprocess(
      emptyValueToUndefined,
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha valida.").optional()
    ),
    financing_months: z.preprocess(
      emptyValueToUndefined,
      z.coerce.number().int().positive("Usa meses validos.").optional()
    ),
    is_extra_payment: z.coerce.boolean().default(false),
    is_financed: z.coerce.boolean().default(false),
    payment_scope: z.enum(paymentScopeValues, {
      errorMap: () => ({ message: "Selecciona el alcance del pago." })
    }),
    promotion_name: optionalShortTextSchema,
    stage: z.enum(stageValues).default("documentacion"),
    status: z.enum(paymentStatusValues).default("pending"),
    traveler_id: optionalUuidSchema
  })
  .superRefine((value, context) => {
    if (value.payment_scope === "traveler" && !value.traveler_id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona la persona relacionada con el pago.",
        path: ["traveler_id"]
      });
    }

    if (!value.is_financed && value.financing_months) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Marca financiamiento para usar meses.",
        path: ["financing_months"]
      });
    }
  });

export const internalPaymentStatusUpdateSchema = z.object({
  status: z.enum(paymentStatusValues, {
    errorMap: () => ({ message: "Selecciona un estado valido." })
  })
});

export type InternalPaymentCreateData = z.output<typeof internalPaymentCreateSchema>;
export type InternalPaymentStatusUpdateData = z.output<
  typeof internalPaymentStatusUpdateSchema
>;
