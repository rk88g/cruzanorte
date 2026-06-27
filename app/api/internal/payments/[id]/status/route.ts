import { NextRequest, NextResponse } from "next/server";
import { updateInternalPaymentStatus } from "@/lib/payments";
import { getInternalSession } from "@/lib/internal/session";
import { internalPaymentStatusUpdateSchema } from "@/validations/payment";

export const runtime = "nodejs";

type PaymentStatusRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: PaymentStatusRouteContext) {
  try {
    const session = await getInternalSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion interna para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = internalPaymentStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa el estado del pago."
        },
        { status: 400 }
      );
    }

    const result = await updateInternalPaymentStatus(id, parsed.data);

    if (result.status === "not_found") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos actualizar el pago." },
      { status: 500 }
    );
  }
}
