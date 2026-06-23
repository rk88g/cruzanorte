import { createHmac, randomInt, timingSafeEqual } from "crypto";
import {
  OTP_CODE_LENGTH,
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS
} from "@/lib/constants";
import { isValidOtpCode } from "@/lib/otp";

type SendWhatsappOtpMockInput = {
  code: string;
  hostname?: string;
  whatsapp_e164: string;
};

const DEFAULT_MOCK_OTP_CODE = "123456";

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

function getConfiguredMockOtpCode() {
  const configuredCode = process.env.OTP_TEST_CODE ?? DEFAULT_MOCK_OTP_CODE;

  if (isValidOtpCode(configuredCode)) {
    return configuredCode;
  }

  return DEFAULT_MOCK_OTP_CODE;
}

function isProductionEnvironment() {
  return process.env.VERCEL_ENV === "production";
}

function isOtpAllowedForWhatsapp(whatsapp_e164: string) {
  const allowedE164 = process.env.OTP_TEST_ALLOWED_E164?.trim();

  return !allowedE164 || allowedE164 === whatsapp_e164;
}

export function isOtpTestModeEnabled(whatsapp_e164: string) {
  if (process.env.OTP_TEST_MODE !== "true") {
    return false;
  }

  if (!isOtpAllowedForWhatsapp(whatsapp_e164)) {
    return false;
  }

  if (isProductionEnvironment() && process.env.OTP_TEST_ALLOW_PRODUCTION !== "true") {
    return false;
  }

  return true;
}

export function getOtpCodeForEnvironment(whatsapp_e164: string) {
  if (isOtpTestModeEnabled(whatsapp_e164)) {
    return getConfiguredMockOtpCode();
  }

  return generateOtpCode();
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

function isLocalHostname(hostname?: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function canExposeOtpTestCode(whatsapp_e164: string, hostname?: string) {
  return (
    isOtpTestModeEnabled(whatsapp_e164) ||
    (process.env.NODE_ENV !== "production" && isOtpAllowedForWhatsapp(whatsapp_e164)) ||
    isLocalHostname(hostname)
  );
}

export async function sendWhatsappOtpMock({ code, hostname, whatsapp_e164 }: SendWhatsappOtpMockInput) {
  if (canExposeOtpTestCode(whatsapp_e164, hostname)) {
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
