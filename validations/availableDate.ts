import { z } from "zod";
import {
  AVAILABLE_DATE_OTHER_LOCATION_VALUE,
  AVAILABLE_DATE_STATUSES
} from "@/lib/constants";

const emptyValueToUndefined = (value: unknown) => {
  if (value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const nullToEmptyString = (value: unknown) => (value === null ? "" : value);

export const availableDateFormSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha valida."),
    location_city: z.preprocess(
      nullToEmptyString,
      z.string().trim().min(1, "Selecciona la ciudad o base.").max(120)
    ),
    custom_location_city: z.preprocess(
      emptyValueToUndefined,
      z.string().trim().max(120, "Usa maximo 120 caracteres.").optional()
    ),
    capacity_total: z.coerce
      .number({
        invalid_type_error: "Ingresa el cupo total."
      })
      .int("Ingresa un numero entero.")
      .min(1, "El cupo total debe ser al menos 1."),
    capacity_available: z.coerce
      .number({
        invalid_type_error: "Ingresa el cupo disponible."
      })
      .int("Ingresa un numero entero.")
      .min(0, "El cupo disponible no puede ser negativo."),
    status: z.enum(AVAILABLE_DATE_STATUSES, {
      errorMap: () => ({ message: "Selecciona el estado de la fecha." })
    }),
    notes_internal: z.preprocess(
      emptyValueToUndefined,
      z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
    )
  })
  .superRefine((value, context) => {
    if (
      value.location_city === AVAILABLE_DATE_OTHER_LOCATION_VALUE &&
      !value.custom_location_city
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Especifica ciudad o base.",
        path: ["custom_location_city"]
      });
    }

    if (value.capacity_available > value.capacity_total) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El cupo disponible no puede ser mayor que el cupo total.",
        path: ["capacity_available"]
      });
    }
  });

export const availableDateSchema = availableDateFormSchema.transform((value) => ({
  date: value.date,
  location_city:
    value.location_city === AVAILABLE_DATE_OTHER_LOCATION_VALUE
      ? value.custom_location_city ?? ""
      : value.location_city,
  capacity_total: value.capacity_total,
  capacity_available: value.capacity_available,
  status: value.status,
  notes_internal: value.notes_internal ?? null
}));

export const requestApplicationDateSchema = z.object({
  available_date_id: z.string().uuid("Selecciona una fecha disponible.")
});

export const dateDecisionSchema = z.object({
  notes: z.preprocess(
    emptyValueToUndefined,
    z.string().trim().max(1000, "Usa maximo 1000 caracteres.").optional()
  )
});

export type AvailableDateFormInput = z.input<typeof availableDateFormSchema>;
export type AvailableDateData = z.output<typeof availableDateSchema>;
export type AvailableDateInput = z.input<typeof availableDateSchema>;
export type DateDecisionInput = z.input<typeof dateDecisionSchema>;
export type DateDecisionData = z.output<typeof dateDecisionSchema>;
export type RequestApplicationDateInput = z.input<typeof requestApplicationDateSchema>;
