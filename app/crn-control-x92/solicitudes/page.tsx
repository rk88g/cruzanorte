import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InternalApplicationsTable } from "@/components/internal/InternalApplicationsTable";
import { InternalShell } from "@/components/internal/InternalShell";
import { getInternalApplications } from "@/lib/internal/queries";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

export const metadata: Metadata = {
  title: "Solicitudes internas",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalApplicationsPage() {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const applications = await getInternalApplications();

  return (
    <InternalShell
      title="Solicitudes"
      description="Listado solo lectura de solicitudes creadas por clientes de Cruza Norte."
    >
      <InternalApplicationsTable applications={applications} />
    </InternalShell>
  );
}
