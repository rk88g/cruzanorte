import { z } from "zod";
import { calculateAgeFromBirthDate } from "@/lib/age";
import {
  buildWhatsappE164,
  isValidCountryCode,
  isValidNationalPhoneNumber,
  isValidWhatsappE164
} from "@/lib/phone";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalEmailSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().email("Ingresa un correo electronico valido.").max(160).optional()
);

const optionalTextSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
);

export const travelerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(1, "Ingresa el nombre completo.")
      .max(140, "Usa maximo 140 caracteres."),
    birth_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha de nacimiento valida."),
    age: z.coerce
      .number({
        invalid_type_error: "Ingresa una edad valida."
      })
      .int("Ingresa una edad valida.")
      .min(0, "La edad no puede ser negativa.")
      .max(130, "Ingresa una edad valida."),
    country_origin: z
      .string()
      .trim()
      .min(1, "Selecciona el pais de origen.")
      .max(80, "Usa maximo 80 caracteres."),
    nationality: z
      .string()
      .trim()
      .min(1, "Selecciona la nacionalidad.")
      .max(80, "Usa maximo 80 caracteres."),
    relationship: z
      .string()
      .trim()
      .min(1, "Selecciona el parentesco o relacion.")
      .max(80, "Usa maximo 80 caracteres."),
    country_code: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    phone_number: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
    email: optionalEmailSchema,
    is_main_client: z.boolean().default(false),
    requires_mexico_entry_review: z.boolean().default(false),
    notes: optionalTextSchema
  })
  .superRefine((value, context) => {
    const calculatedAge = calculateAgeFromBirthDate(value.birth_date);

    if (calculatedAge === null || calculatedAge < 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa una fecha de nacimiento valida.",
        path: ["birth_date"]
      });
    }

    if (value.phone_number && !value.country_code) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona el codigo de pais.",
        path: ["country_code"]
      });
    }

    if (value.country_code && value.phone_number && !isValidCountryCode(value.country_code)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona un codigo de pais valido.",
        path: ["country_code"]
      });
    }

    if (value.phone_number && !isValidNationalPhoneNumber(value.phone_number)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa un numero de WhatsApp valido.",
        path: ["phone_number"]
      });
    }

    if (value.country_code && value.phone_number) {
      const whatsappE164 = buildWhatsappE164(value.country_code, value.phone_number);

      if (!isValidWhatsappE164(whatsappE164)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresa un WhatsApp valido.",
          path: ["phone_number"]
        });
      }
    }
  })
  .transform((value) => {
    const age = calculateAgeFromBirthDate(value.birth_date) ?? value.age;
    const hasWhatsapp = Boolean(value.country_code && value.phone_number);

    return {
      ...value,
      age,
      country_code: hasWhatsapp ? value.country_code ?? null : null,
      phone_number: hasWhatsapp ? value.phone_number ?? null : null,
      whatsapp_e164: hasWhatsapp
        ? buildWhatsappE164(value.country_code ?? "", value.phone_number ?? "")
        : null,
      email: value.email ?? null,
      notes: value.notes ?? null
    };
  });

export type TravelerInput = z.input<typeof travelerSchema>;
export type TravelerData = z.output<typeof travelerSchema>;
