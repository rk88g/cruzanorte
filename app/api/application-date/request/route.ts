import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { requestAvailableDateForClient } from "@/lib/availableDates";
import { requestApplicationDateSchema } from "@/validations/availableDate";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await getClientSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion para continuar." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = requestApplicationDateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Selecciona una fecha disponible."
        },
        { status: 400 }
      );
    }

    const result = await requestAvailableDateForClient(
      session.userId,
      parsed.data.available_date_id
    );

    if (result.status !== "requested") {
      const statusCode =
        result.status === "no_active_application"
          ? 404
          : result.status === "date_unavailable"
            ? 409
            : 400;

      return NextResponse.json({ ok: false, message: result.message }, { status: statusCode });
    }

    return NextResponse.json({ ok: true, message: result.message });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos solicitar la fecha. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
