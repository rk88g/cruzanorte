import { NextRequest, NextResponse } from "next/server";
import { createClientSession } from "@/lib/auth/session";
import { isOtpExpired, verifyOtpHash } from "@/lib/auth/otp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { otpVerificationSchema } from "@/validations";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = otpVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "El codigo debe tener 6 digitos." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const otpResult = await supabase
      .from("whatsapp_otps")
      .select("id, code_hash, expires_at, attempts, max_attempts, consumed_at")
      .eq("whatsapp_e164", parsed.data.whatsapp_e164)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpResult.error || !otpResult.data) {
      return NextResponse.json({ ok: false, message: "El codigo no es correcto." }, { status: 400 });
    }

    const otp = otpResult.data;

    if (otp.consumed_at) {
      return NextResponse.json({ ok: false, message: "El codigo no es correcto." }, { status: 400 });
    }

    if (otp.attempts >= otp.max_attempts) {
      return NextResponse.json(
        { ok: false, message: "Se supero el numero maximo de intentos." },
        { status: 429 }
      );
    }

    if (isOtpExpired(otp.expires_at)) {
      return NextResponse.json(
        { ok: false, message: "El codigo expiro. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const isValidCode = verifyOtpHash(parsed.data.code, parsed.data.whatsapp_e164, otp.code_hash);

    if (!isValidCode) {
      const nextAttempts = otp.attempts + 1;

      await supabase.from("whatsapp_otps").update({ attempts: nextAttempts }).eq("id", otp.id);

      return NextResponse.json(
        {
          ok: false,
          message:
            nextAttempts >= otp.max_attempts
              ? "Se supero el numero maximo de intentos."
              : "El codigo no es correcto."
        },
        { status: nextAttempts >= otp.max_attempts ? 429 : 400 }
      );
    }

    const consumedAt = new Date().toISOString();

    const consumeResult = await supabase
      .from("whatsapp_otps")
      .update({ consumed_at: consumedAt })
      .eq("id", otp.id)
      .is("consumed_at", null);

    if (consumeResult.error) {
      return NextResponse.json(
        { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
        { status: 500 }
      );
    }

    const existingUser = await supabase
      .from("users")
      .select("id, role, status, whatsapp_e164")
      .eq("whatsapp_e164", parsed.data.whatsapp_e164)
      .maybeSingle();

    if (existingUser.error) {
      return NextResponse.json(
        { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
        { status: 500 }
      );
    }

    let userId = existingUser.data?.id;
    const userStatus = existingUser.data?.status;

    if (existingUser.data && (existingUser.data.role !== "client" || userStatus !== "active")) {
      return NextResponse.json(
        { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
        { status: 403 }
      );
    }

    if (!userId) {
      const createdUser = await supabase
        .from("users")
        .insert({
          country_code: parsed.data.country_code,
          phone_number: parsed.data.phone_number,
          whatsapp_e164: parsed.data.whatsapp_e164,
          role: "client",
          status: "active"
        })
        .select("id")
        .single();

      if (createdUser.error || !createdUser.data) {
        return NextResponse.json(
          { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
          { status: 500 }
        );
      }

      userId = createdUser.data.id;
    }

    await createClientSession(userId, parsed.data.whatsapp_e164);

    return NextResponse.json({
      ok: true,
      redirect_to: "/panel"
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos iniciar sesion. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
