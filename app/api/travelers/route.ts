import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { createTravelerForClient } from "@/lib/travelers";
import { travelerSchema } from "@/validations/traveler";

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
    const parsed = travelerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa la informacion de la persona."
        },
        { status: 400 }
      );
    }

    const result = await createTravelerForClient(session.userId, parsed.data);

    if (result.status === "no_active_application") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    if (result.status === "limit_reached") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
    }

    if (result.status === "created") {
      return NextResponse.json({
        ok: true,
        traveler: result.traveler
      });
    }

    return NextResponse.json(
      { ok: false, message: "No pudimos guardar esta persona." },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos guardar esta persona. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
