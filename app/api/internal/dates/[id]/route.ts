import { NextRequest, NextResponse } from "next/server";
import { updateAvailableDate } from "@/lib/availableDates";
import { getInternalSession } from "@/lib/internal/session";
import { availableDateSchema } from "@/validations/availableDate";

export const runtime = "nodejs";

type InternalDateRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: InternalDateRouteContext) {
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

    const availableDate = await updateAvailableDate(id, parsed.data);

    return NextResponse.json({
      ok: true,
      available_date: availableDate
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos actualizar la fecha disponible." },
      { status: 500 }
    );
  }
}
