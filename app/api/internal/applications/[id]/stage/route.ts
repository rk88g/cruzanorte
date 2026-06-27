import { NextRequest, NextResponse } from "next/server";
import { updateInternalApplicationStage } from "@/lib/internal/stageActions";
import { getInternalSession } from "@/lib/internal/session";
import { internalStageUpdateSchema } from "@/validations/applicationStage";

export const runtime = "nodejs";

type StageRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: StageRouteContext) {
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
    const parsed = internalStageUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa la etapa seleccionada."
        },
        { status: 400 }
      );
    }

    const result = await updateInternalApplicationStage({
      actorEmail: session.email,
      applicationId: id,
      input: parsed.data
    });

    if (result.status === "not_found") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      progress: result.progress
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos actualizar la etapa." },
      { status: 500 }
    );
  }
}
