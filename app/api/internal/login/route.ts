import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyInternalCredentials } from "@/lib/internal/auth";
import { createInternalSession } from "@/lib/internal/session";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";

export const runtime = "nodejs";

const internalLoginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo valido."),
  password: z.string().min(1, "Ingresa tu contrasena.")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = internalLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: parsed.error.issues[0]?.message ?? "Revisa tus datos de acceso."
        },
        { status: 400 }
      );
    }

    const isValid = verifyInternalCredentials(parsed.data.email, parsed.data.password);

    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: "Los datos de acceso no son correctos." },
        { status: 401 }
      );
    }

    await createInternalSession(parsed.data.email.trim().toLowerCase());

    return NextResponse.json({
      ok: true,
      redirect_to: INTERNAL_ROUTES.base
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "El acceso interno no esta configurado correctamente." },
      { status: 500 }
    );
  }
}
