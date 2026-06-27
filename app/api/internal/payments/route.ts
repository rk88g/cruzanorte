import { NextRequest, NextResponse } from "next/server";
import { createInternalPayment } from "@/lib/payments";
import { getInternalSession } from "@/lib/internal/session";
import { internalPaymentCreateSchema } from "@/validations/payment";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getInternalSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion interna para continuar." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const applicationId =
      typeof body.application_id === "string" ? body.application_id : "";
    const parsed = internalPaymentCreateSchema.safeParse(body);

    if (!applicationId) {
      return NextResponse.json(
        { ok: false, message: "Solicitud invalida." },
        { status: 400 }
      );
    }

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa el compromiso de pago."
        },
        { status: 400 }
      );
    }

    const result = await createInternalPayment(applicationId, parsed.data);

    if (result.status !== "created") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      payment: result.payment
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos crear el compromiso de pago." },
      { status: 500 }
    );
  }
}
