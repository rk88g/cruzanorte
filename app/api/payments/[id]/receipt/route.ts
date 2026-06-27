import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/session";
import { uploadPaymentReceiptForClient } from "@/lib/paymentReceipts";
import { paymentReceiptUploadSchema } from "@/validations/paymentReceipt";

export const runtime = "nodejs";

type PaymentReceiptRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: PaymentReceiptRouteContext) {
  try {
    const session = await getClientSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const parsed = paymentReceiptUploadSchema.safeParse({
      amount_reported: formData.get("amount_reported"),
      client_notes: formData.get("client_notes")
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa el comprobante."
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

    const result = await uploadPaymentReceiptForClient(
      session.userId,
      id,
      parsed.data,
      file
    );

    if (result.status !== "uploaded") {
      const statusCode = result.status === "not_found" ? 404 : 400;

      return NextResponse.json({ ok: false, message: result.message }, { status: statusCode });
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      receipt: result.receipt
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos subir el comprobante." },
      { status: 500 }
    );
  }
}
