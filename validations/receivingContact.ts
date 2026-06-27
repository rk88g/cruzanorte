import { z } from "zod";
import { US_CITY_OTHER_VALUE } from "@/lib/constants";
import {
  buildWhatsappE164,
  isValidCountryCode,
  isValidNationalPhoneNumber,
  isValidWhatsappE164
} from "@/lib/phone";

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

const optionalNotesSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
);

const optionalCityOtherSchema = z.preprocess(
  emptyValueToUndefined,
  z.string().trim().max(120, "Usa maximo 120 caracteres.").optional()
);

export const receivingContactFormSchema = z
  .object({
    full_name: z.preprocess(
      nullToEmptyString,
      z
        .string()
        .trim()
        .min(1, "Ingresa el nombre completo.")
        .max(140, "Usa maximo 140 caracteres.")
    ),
    relationship: z.preprocess(
      nullToEmptyString,
      z
        .string()
        .trim()
        .min(1, "Selecciona la relacion con el cliente.")
        .max(80, "Usa maximo 80 caracteres.")
    ),
    country_code: z.preprocess(
      nullToEmptyString,
      z
        .string()
        .trim()
        .min(1, "Selecciona el codigo de pais.")
        .refine((value) => isValidCountryCode(value), "Selecciona un codigo de pais valido.")
    ),
    phone_number: z.preprocess(
      nullToEmptyString,
      z
        .string()
        .trim()
        .min(7, "Ingresa un numero de WhatsApp valido.")
        .max(15, "Ingresa un numero de WhatsApp valido.")
        .refine(
          (value) => isValidNationalPhoneNumber(value),
          "Ingresa solo numeros en el WhatsApp."
        )
    ),
    us_state_id: z.preprocess(
      nullToEmptyString,
      z.string().trim().min(1, "Selecciona el estado.")
    ),
    us_city_id: z.preprocess(nullToEmptyString, z.string().trim()),
    city_other: optionalCityOtherSchema,
    address_reference: z.preprocess(
      nullToEmptyString,
      z
        .string()
        .trim()
        .min(1, "Ingresa una direccion aproximada o zona de referencia.")
        .max(240, "Usa maximo 240 caracteres.")
    ),
    notes: optionalNotesSchema
  })
  .superRefine((value, context) => {
    const usesOtherCity =
      value.us_city_id === US_CITY_OTHER_VALUE || (!value.us_city_id && Boolean(value.city_other));
    const hasKnownCity = Boolean(value.us_city_id && value.us_city_id !== US_CITY_OTHER_VALUE);
    const whatsappE164 = buildWhatsappE164(value.country_code, value.phone_number);

    if (!isValidWhatsappE164(whatsappE164)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa un WhatsApp valido.",
        path: ["phone_number"]
      });
    }

    if (!hasKnownCity && !usesOtherCity) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona la ciudad.",
        path: ["us_city_id"]
      });
    }

    if (usesOtherCity && !value.city_other) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe la ciudad.",
        path: ["city_other"]
      });
    }
  });

export const receivingContactSchema = receivingContactFormSchema.transform((value) => {
  const usesOtherCity =
    value.us_city_id === US_CITY_OTHER_VALUE || (!value.us_city_id && Boolean(value.city_other));

  return {
    ...value,
    city_other: usesOtherCity ? value.city_other ?? null : null,
    notes: value.notes ?? null,
    us_city_id: usesOtherCity ? null : value.us_city_id,
    whatsapp_e164: buildWhatsappE164(value.country_code, value.phone_number)
  };
});

export type ReceivingContactFormInput = z.input<typeof receivingContactFormSchema>;
export type ReceivingContactFormData = z.output<typeof receivingContactFormSchema>;
export type ReceivingContactInput = z.input<typeof receivingContactSchema>;
export type ReceivingContactData = z.output<typeof receivingContactSchema>;
