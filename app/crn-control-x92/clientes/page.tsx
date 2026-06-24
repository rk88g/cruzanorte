import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InternalClientsTable } from "@/components/internal/InternalClientsTable";
import { InternalShell } from "@/components/internal/InternalShell";
import { getInternalClients } from "@/lib/internal/queries";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

export const metadata: Metadata = {
  title: "Clientes internos",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalClientsPage() {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const clients = await getInternalClients();

  return (
    <InternalShell
      title="Clientes"
      description="Listado solo lectura de clientes con telefonos separados por codigo, numero y WhatsApp internacional."
    >
      <InternalClientsTable clients={clients} />
    </InternalShell>
  );
}
