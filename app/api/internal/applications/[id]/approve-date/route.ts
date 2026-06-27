import { NextRequest, NextResponse } from "next/server";
import { approveApplicationRequestedDate } from "@/lib/availableDates";
import { getInternalSession } from "@/lib/internal/session";
import { dateDecisionSchema } from "@/validations/availableDate";

export const runtime = "nodejs";

type ApproveDateRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: ApproveDateRouteContext) {
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

    const result = await approveApplicationRequestedDate(id, parsed.data);

    if (result.status !== "approved") {
      const statusCode =
        result.status === "not_found" || result.status === "date_not_found"
          ? 404
          : result.status === "insufficient_capacity"
            ? 409
            : 400;

      return NextResponse.json({ ok: false, message: result.message }, { status: statusCode });
    }

    return NextResponse.json({ ok: true, message: result.message });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos autorizar la fecha." },
      { status: 500 }
    );
  }
}
