import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import {
  createClientDocumentSignedUrl,
  createInternalDocumentSignedUrl
} from "@/lib/documents";
import { getInternalSession } from "@/lib/internal/session";

export const runtime = "nodejs";

type DocumentSignedUrlContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: DocumentSignedUrlContext) {
  try {
    const { id } = await context.params;
    const internalSession = await getInternalSession();

    if (internalSession) {
      const signedUrl = await createInternalDocumentSignedUrl(id);

      if (!signedUrl) {
        return NextResponse.json(
          { ok: false, message: "No encontramos el archivo." },
          { status: 404 }
        );
      }

      return NextResponse.json({ ok: true, signed_url: signedUrl });
    }

    const clientSession = await getClientSession();

    if (!clientSession) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion para continuar." },
        { status: 401 }
      );
    }

    const signedUrl = await createClientDocumentSignedUrl(clientSession.userId, id);

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
