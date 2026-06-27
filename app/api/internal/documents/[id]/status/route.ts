import { NextRequest, NextResponse } from "next/server";
import { updateInternalDocumentStatus } from "@/lib/documents";
import { getInternalSession } from "@/lib/internal/session";
import { documentStatusUpdateSchema } from "@/validations/document";

export const runtime = "nodejs";

type InternalDocumentStatusContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, context: InternalDocumentStatusContext) {
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
    const parsed = documentStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa el estado del documento."
        },
        { status: 400 }
      );
    }

    const result = await updateInternalDocumentStatus(id, parsed.data);

    if (result.status === "not_found") {
      return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      message: result.message
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos actualizar el documento." },
      { status: 500 }
    );
  }
}
