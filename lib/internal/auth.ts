import { createHash, timingSafeEqual } from "crypto";

type InternalAccessConfig = {
  email: string;
  password: string;
};

function getInternalAccessConfig(): InternalAccessConfig {
  const email = process.env.INTERNAL_ACCESS_EMAIL;
  const password = process.env.INTERNAL_ACCESS_PASSWORD;
  const sessionSecret = process.env.INTERNAL_SESSION_SECRET;

  if (!email || !password || !sessionSecret) {
    throw new Error("Internal access is not configured.");
  }

  return {
    email,
    password
  };
}

function secureCompare(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();

  return timingSafeEqual(valueHash, expectedHash);
}

export function verifyInternalCredentials(email: string, password: string) {
  const config = getInternalAccessConfig();
  const normalizedEmail = email.trim().toLowerCase();
  const configuredEmail = config.email.trim().toLowerCase();

  return (
    secureCompare(normalizedEmail, configuredEmail) &&
    secureCompare(password, config.password)
  );
}
