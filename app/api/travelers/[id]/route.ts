import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { deleteTravelerForClient, updateTravelerForClient } from "@/lib/travelers";
import { travelerSchema } from "@/validations/traveler";

export const runtime = "nodejs";

type TravelerRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: TravelerRouteContext) {
  try {
    const session = await getClientSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
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

    const result = await updateTravelerForClient(session.userId, id, parsed.data);

    if (result.status === "no_active_application" || result.status === "not_found") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    if (result.status === "updated") {
      return NextResponse.json({
        ok: true,
        traveler: result.traveler
      });
    }

    return NextResponse.json(
      { ok: false, message: "No pudimos actualizar esta persona." },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos actualizar esta persona. Intenta nuevamente." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: TravelerRouteContext) {
  try {
    const session = await getClientSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const result = await deleteTravelerForClient(session.userId, id);

    if (result.status === "no_active_application" || result.status === "not_found") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      ok: true
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos eliminar esta persona. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
