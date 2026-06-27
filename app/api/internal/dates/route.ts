import { NextRequest, NextResponse } from "next/server";
import { createAvailableDate } from "@/lib/availableDates";
import { getInternalSession } from "@/lib/internal/session";
import { availableDateSchema } from "@/validations/availableDate";

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
    const parsed = availableDateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa la informacion de la fecha."
        },
        { status: 400 }
      );
    }

    const availableDate = await createAvailableDate(parsed.data);

    return NextResponse.json({
      ok: true,
      available_date: availableDate
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos crear la fecha disponible." },
      { status: 500 }
    );
  }
}
