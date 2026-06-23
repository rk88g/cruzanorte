export function sanitizePhoneNumber(value: string) {
  return value.trim();
}

export function sanitizeCountryCode(value: string) {
  return value.trim();
}

export function buildWhatsappE164(countryCode: string, phoneNumber: string) {
  return `${sanitizeCountryCode(countryCode)}${sanitizePhoneNumber(phoneNumber)}`;
}

export function isValidCountryCode(value: string) {
  return /^\+[1-9][0-9]{0,3}$/.test(value);
}

export function isValidNationalPhoneNumber(value: string) {
  return /^[0-9]{7,15}$/.test(value);
}

export function isValidWhatsappE164(value: string) {
  return /^\+[1-9][0-9]{7,15}$/.test(value);
}
