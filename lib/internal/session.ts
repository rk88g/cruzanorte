import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const INTERNAL_SESSION_COOKIE = "cn_internal_session";

const INTERNAL_SESSION_DURATION_SECONDS = 60 * 60 * 8;

export type InternalSession = {
  email: string;
  role: "owner";
  expiresAt: number;
};

function getInternalSessionSecret() {
  const secret = process.env.INTERNAL_SESSION_SECRET;

  if (!secret) {
    throw new Error("Internal session secret is not configured.");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getInternalSessionSecret()).update(payload).digest("base64url");
}

function isValidSignature(payload: string, signature: string) {
  const expected = Buffer.from(signPayload(payload));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function encodeInternalSession(session: InternalSession) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function decodeInternalSession(value: string): InternalSession | null {
  const [payload, signature] = value.split(".");

  if (!payload || !signature || !isValidSignature(payload, signature)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as InternalSession;

    if (!session.email || session.role !== "owner") {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function createInternalSession(email: string) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + INTERNAL_SESSION_DURATION_SECONDS * 1000;
  const session = encodeInternalSession({
    email,
    role: "owner",
    expiresAt
  });

  cookieStore.set(INTERNAL_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: INTERNAL_SESSION_DURATION_SECONDS
  });
}

export async function getInternalSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(INTERNAL_SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return decodeInternalSession(value);
  } catch {
    return null;
  }
}

export async function clearInternalSession() {
  const cookieStore = await cookies();

  cookieStore.delete(INTERNAL_SESSION_COOKIE);
}
