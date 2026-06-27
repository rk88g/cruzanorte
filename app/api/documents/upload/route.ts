import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { uploadDocumentForClient } from "@/lib/documents";
import { documentUploadSchema } from "@/validations/document";

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

    const formData = await request.formData();
    const file = formData.get("file");
    const parsed = documentUploadSchema.safeParse({
      application_id: formData.get("application_id"),
      client_notes: formData.get("client_notes"),
      document_type: formData.get("document_type"),
      mexico_requirement_id: formData.get("mexico_requirement_id"),
      scope: formData.get("scope"),
      traveler_id: formData.get("traveler_id")
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa la informacion del documento."
        },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Selecciona un archivo." },
        { status: 400 }
      );
    }

    const result = await uploadDocumentForClient(session.userId, parsed.data, file);

    if (result.status !== "uploaded") {
      const statusCode =
        result.status === "no_active_application"
          ? 404
          : result.status === "not_allowed"
            ? 403
            : 400;

      return NextResponse.json({ ok: false, message: result.message }, { status: statusCode });
    }

    return NextResponse.json({
      ok: true,
      document: result.document,
      message: result.message
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos subir el documento. Intenta nuevamente." },
      { status: 500 }
    );
  }
}
