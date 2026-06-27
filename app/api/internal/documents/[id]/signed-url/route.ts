import { NextResponse } from "next/server";
import { createInternalDocumentSignedUrl } from "@/lib/documents";
import { getInternalSession } from "@/lib/internal/session";

export const runtime = "nodejs";

type InternalDocumentSignedUrlContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: InternalDocumentSignedUrlContext) {
  try {
    const session = await getInternalSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion interna para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const signedUrl = await createInternalDocumentSignedUrl(id);

    if (!signedUrl) {
      return NextResponse.json(
        { ok: false, message: "No encontramos el archivo." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, signed_url: signedUrl });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos preparar el archivo." },
      { status: 500 }
    );
  }
}
