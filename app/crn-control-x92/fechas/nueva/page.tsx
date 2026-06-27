import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvailableDateForm } from "@/components/forms/AvailableDateForm";
import { InternalShell } from "@/components/internal/InternalShell";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

export const metadata: Metadata = {
  title: "Nueva fecha",
  robots: {
    index: false,
    follow: false
  }
};

export default async function NewInternalDatePage() {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  return (
    <InternalShell
      title="Nueva fecha"
      description="Crea una fecha disponible con ciudad/base, cupos y estado operativo."
    >
      <AvailableDateForm mode="create" />
    </InternalShell>
  );
}
