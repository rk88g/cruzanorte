import { z } from "zod";
import {
  DOCUMENT_STATUSES,
  GENERAL_DOCUMENT_TYPES,
  MEXICO_REVIEW_DOCUMENT_TYPES,
  TRAVELER_DOCUMENT_TYPES
} from "@/lib/constants";

export const documentScopes = ["application", "traveler", "mexico_requirement"] as const;

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

const optionalNotesSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
);

export const documentUploadSchema = z
  .object({
    application_id: z.string().uuid("Solicitud invalida."),
    client_notes: optionalNotesSchema,
    document_type: z.string().trim().min(1, "Selecciona el tipo de documento."),
    mexico_requirement_id: optionalUuidSchema,
    scope: z.enum(documentScopes, {
      errorMap: () => ({ message: "Selecciona el alcance del documento." })
    }),
    traveler_id: optionalUuidSchema
  })
  .superRefine((value, context) => {
    if (value.scope === "application") {
      if (![...GENERAL_DOCUMENT_TYPES].includes(value.document_type as never)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tipo de documento general invalido.",
          path: ["document_type"]
        });
      }
    }

    if (value.scope === "traveler") {
      if (!value.traveler_id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecciona la persona que viaja.",
          path: ["traveler_id"]
        });
      }

      if (![...TRAVELER_DOCUMENT_TYPES].includes(value.document_type as never)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tipo de documento de viajero invalido.",
          path: ["document_type"]
        });
      }
    }

    if (value.scope === "mexico_requirement") {
      if (!value.traveler_id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecciona la persona que viaja.",
          path: ["traveler_id"]
        });
      }

      if (![...MEXICO_REVIEW_DOCUMENT_TYPES].includes(value.document_type as never)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tipo de documento de revision Mexico invalido.",
          path: ["document_type"]
        });
      }
    }
  });

export const documentStatusUpdateSchema = z
  .object({
    admin_notes: optionalNotesSchema,
    status: z.enum(
      DOCUMENT_STATUSES.filter((status) => status !== "pending" && status !== "uploaded") as [
        "in_review",
        "accepted",
        "rejected",
        "replacement_requested"
      ],
      {
        errorMap: () => ({ message: "Selecciona un estado valido." })
      }
    )
  })
  .superRefine((value, context) => {
    if (
      (value.status === "rejected" || value.status === "replacement_requested") &&
      !value.admin_notes
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Agrega una nota para el cliente.",
        path: ["admin_notes"]
      });
    }
  });

export type DocumentScope = (typeof documentScopes)[number];
export type DocumentUploadInput = z.input<typeof documentUploadSchema>;
export type DocumentUploadData = z.output<typeof documentUploadSchema>;
export type DocumentStatusUpdateInput = z.input<typeof documentStatusUpdateSchema>;
export type DocumentStatusUpdateData = z.output<typeof documentStatusUpdateSchema>;
