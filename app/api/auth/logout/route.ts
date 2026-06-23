import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearClientSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  await clearClientSession();

  return NextResponse.redirect(new URL("/ingresar", request.url), 303);
}
