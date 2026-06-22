import { z } from "zod";
import { VERIFICATION_CODE_LENGTH } from "@/lib/constants";

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
