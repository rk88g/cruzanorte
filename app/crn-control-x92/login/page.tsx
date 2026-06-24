import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InternalLoginForm } from "@/components/internal/InternalLoginForm";
import { getInternalSession } from "@/lib/internal/session";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";

export const metadata: Metadata = {
  title: "Acceso interno",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalLoginPage() {
  const session = await getInternalSession();

  if (session) {
    redirect(INTERNAL_ROUTES.base);
  }

  return <InternalLoginForm />;
}
