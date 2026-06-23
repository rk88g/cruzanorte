import { createHmac, randomInt, timingSafeEqual } from "crypto";
import {
  OTP_CODE_LENGTH,
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS
} from "@/lib/constants";

type SendWhatsappOtpMockInput = {
  code: string;
  whatsapp_e164: string;
};

function getOtpSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("OTP secret is not configured.");
  }

  return secret;
}

export function generateOtpCode(length = OTP_CODE_LENGTH) {
  const max = 10 ** length;

  return String(randomInt(0, max)).padStart(length, "0");
}

export function hashOtpCode(code: string, whatsapp_e164: string) {
  return createHmac("sha256", getOtpSecret())
    .update(`${whatsapp_e164}:${code}`)
    .digest("hex");
}

export function verifyOtpHash(code: string, whatsapp_e164: string, codeHash: string) {
  const expectedHash = hashOtpCode(code, whatsapp_e164);
  const expected = Buffer.from(expectedHash, "hex");
  const received = Buffer.from(codeHash, "hex");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function getOtpExpirationDate() {
  return new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
}

export function isOtpExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function isOtpMockModeEnabled() {
  return process.env.NEXT_PUBLIC_OTP_MOCK_MODE === "true" || process.env.NODE_ENV !== "production";
}

export async function sendWhatsappOtpMock({ code, whatsapp_e164 }: SendWhatsappOtpMockInput) {
  if (isOtpMockModeEnabled()) {
    console.info(`Cruza Norte OTP temporal para ${whatsapp_e164}: ${code}`);

    return {
      delivered: true,
      testCode: code
    };
  }

  return {
    delivered: true,
    testCode: undefined
  };
}

export const OTP_SETTINGS = {
  codeLength: OTP_CODE_LENGTH,
  maxAttempts: OTP_MAX_ATTEMPTS,
  expirationMinutes: OTP_EXPIRATION_MINUTES
} as const;
