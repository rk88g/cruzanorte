import { NextRequest, NextResponse } from "next/server";
import { OTP_MAX_ATTEMPTS } from "@/lib/constants";
import {
  getOtpCodeForRequest,
  getOtpExpirationDate,
  hashOtpCode,
  sendWhatsappOtpMock
} from "@/lib/auth/otp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { phoneOtpRequestSchema } from "@/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = phoneOtpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Ingresa un numero de WhatsApp valido." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const code = getOtpCodeForRequest(request.nextUrl.hostname);
    const expiresAt = getOtpExpirationDate();
    const codeHash = hashOtpCode(code, parsed.data.whatsapp_e164);
    const userAgent = request.headers.get("user-agent");
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip");

    const { error } = await supabase.from("whatsapp_otps").insert({
      country_code: parsed.data.country_code,
      phone_number: parsed.data.phone_number,
      whatsapp_e164: parsed.data.whatsapp_e164,
      code_hash: codeHash,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      max_attempts: OTP_MAX_ATTEMPTS,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
        { status: 500 }
      );
    }

    const delivery = await sendWhatsappOtpMock({
      code,
      hostname: request.nextUrl.hostname,
      whatsapp_e164: parsed.data.whatsapp_e164
    });

    return NextResponse.json({
      ok: true,
      message: "Codigo enviado.",
      expires_at: expiresAt.toISOString(),
      whatsapp_e164: parsed.data.whatsapp_e164,
      test_code: delivery.testCode
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
