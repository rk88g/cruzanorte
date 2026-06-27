import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { saveReceivingContactForClient } from "@/lib/receivingContact";
import { receivingContactSchema } from "@/validations/receivingContact";

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
    const parsed = receivingContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            parsed.error.issues[0]?.message ??
            "Revisa la informacion del contacto que recibe."
        },
        { status: 400 }
      );
    }

    const result = await saveReceivingContactForClient(session.userId, parsed.data);

    if (result.status === "no_active_application") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    if (result.status === "travelers_incomplete") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
    }

    if (result.status === "created" || result.status === "updated") {
      return NextResponse.json({
        ok: true,
        contact: result.contact
      });
    }

    return NextResponse.json(
      { ok: false, message: "No pudimos guardar el contacto." },
      { status: 500 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos guardar el contacto. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
