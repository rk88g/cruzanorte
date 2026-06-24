import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { startApplicationForClient } from "@/lib/applications";
import { applicationStartSchema } from "@/validations/application";

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
    const parsed = applicationStartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            parsed.error.issues[0]?.message ??
            "Revisa la informacion capturada antes de continuar."
        },
        { status: 400 }
      );
    }

    const result = await startApplicationForClient(session.userId, parsed.data);

    if (result.status === "duplicate") {
      return NextResponse.json(
        {
          ok: false,
          code: "active_application_exists",
          message: "Ya tienes un proceso iniciado. Puedes continuar desde tu panel.",
          redirect_to: "/panel"
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      application_id: result.application.id,
      redirect_to: "/panel"
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "No pudimos iniciar tu registro. Intenta nuevamente."
      },
      { status: 500 }
    );
  }
}
