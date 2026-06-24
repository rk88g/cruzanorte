import { NextRequest, NextResponse } from "next/server";
import { clearInternalSession } from "@/lib/internal/session";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await clearInternalSession();

  return NextResponse.redirect(new URL(INTERNAL_ROUTES.login, request.url), 303);
}
