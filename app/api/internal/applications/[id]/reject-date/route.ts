import { NextRequest, NextResponse } from "next/server";
import { rejectApplicationRequestedDate } from "@/lib/availableDates";
import { getInternalSession } from "@/lib/internal/session";
import { dateDecisionSchema } from "@/validations/availableDate";

export const runtime = "nodejs";

type RejectDateRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RejectDateRouteContext) {
  try {
    const session = await getInternalSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Inicia sesion interna para continuar." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = dateDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa la decision de fecha."
        },
        { status: 400 }
      );
    }

    const result = await rejectApplicationRequestedDate(id, parsed.data);

    if (result.status !== "rejected") {
      const statusCode = result.status === "not_found" ? 404 : 400;

      return NextResponse.json({ ok: false, message: result.message }, { status: statusCode });
    }

    return NextResponse.json({ ok: true, message: result.message });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos rechazar la fecha." },
      { status: 500 }
    );
  }
}
