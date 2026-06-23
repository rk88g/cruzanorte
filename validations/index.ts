import { z } from "zod";
import { OTP_CODE_LENGTH, VERIFICATION_CODE_LENGTH } from "@/lib/constants";
import { buildWhatsappE164 } from "@/lib/phone";

export const whatsappNumberSchema = z
  .string()
  .min(1, "Ingresa un numero WhatsApp.")
  .regex(
    /^\+[1-9]\d{7,14}$/,
    "Usa codigo de pais y solo digitos. Ejemplo: +5210000000000."
  );

export const verificationCodeSchema = z
  .string()
  .length(
    VERIFICATION_CODE_LENGTH,
    `El codigo debe tener ${VERIFICATION_CODE_LENGTH} digitos.`
  )
  .regex(/^\d+$/, "El codigo solo debe incluir digitos.");

export const phoneOtpRequestSchema = z
  .object({
    country_code: z
      .string()
      .min(1, "Ingresa un codigo de pais valido.")
      .regex(/^\+[1-9][0-9]{0,3}$/, "Ingresa un codigo de pais valido."),
    phone_number: z
      .string()
      .min(7, "Ingresa un numero de WhatsApp valido.")
      .max(15, "Ingresa un numero de WhatsApp valido.")
      .regex(/^[0-9]+$/, "Ingresa un numero de WhatsApp valido.")
  })
  .transform((value) => ({
    ...value,
    whatsapp_e164: buildWhatsappE164(value.country_code, value.phone_number)
  }))
  .refine((value) => value.whatsapp_e164.startsWith("+"), {
    message: "Ingresa un numero de WhatsApp valido.",
    path: ["phone_number"]
  });

export const otpVerificationSchema = phoneOtpRequestSchema.and(
  z.object({
    code: z
      .string()
      .length(OTP_CODE_LENGTH, `El codigo debe tener ${OTP_CODE_LENGTH} digitos.`)
      .regex(/^[0-9]+$/, "El codigo debe tener 6 digitos.")
  })
);

export type PhoneOtpRequestInput = z.input<typeof phoneOtpRequestSchema>;
export type PhoneOtpRequest = z.output<typeof phoneOtpRequestSchema>;
export type OtpVerificationInput = z.input<typeof otpVerificationSchema>;
export type OtpVerification = z.output<typeof otpVerificationSchema>;
