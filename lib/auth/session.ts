import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { UserRole } from "@/types/database";

export const CLIENT_SESSION_COOKIE = "cruza_norte_client_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export type ClientSession = {
  userId: string;
  whatsapp_e164: string;
  role: Extract<UserRole, "client">;
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Session secret is not configured.");
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
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function isValidSignature(payload: string, signature: string) {
  const expected = Buffer.from(signPayload(payload));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function encodeSession(session: ClientSession) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function decodeSession(value: string): ClientSession | null {
  const [payload, signature] = value.split(".");

  if (!payload || !signature || !isValidSignature(payload, signature)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as ClientSession;

    if (!session.userId || !session.whatsapp_e164 || session.role !== "client") {
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

export async function createClientSession(userId: string, whatsapp_e164: string) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const session = encodeSession({
    userId,
    whatsapp_e164,
    role: "client",
    expiresAt
  });

  cookieStore.set(CLIENT_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}

export async function getClientSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    return decodeSession(value);
  } catch {
    return null;
  }
}

export async function clearClientSession() {
  const cookieStore = await cookies();

  cookieStore.delete(CLIENT_SESSION_COOKIE);
}
