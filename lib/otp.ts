import { OTP_CODE_LENGTH } from "@/lib/constants";

export function normalizeOtpInput(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidOtpCode(value: string) {
  return new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(value);
}
