import { NextResponse } from "next/server";
import { getInternalSession } from "@/lib/internal/session";
import { createInternalPaymentReceiptSignedUrl } from "@/lib/paymentReceipts";

export const runtime = "nodejs";

type InternalReceiptSignedUrlContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: InternalReceiptSignedUrlContext) {
  try {
    const session = await getInternalSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion interna para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const signedUrl = await createInternalPaymentReceiptSignedUrl(id);

    if (!signedUrl) {
      return NextResponse.json(
        { ok: false, message: "No encontramos el comprobante." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, signed_url: signedUrl });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos preparar el comprobante." },
      { status: 500 }
    );
  }
}
