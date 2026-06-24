import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PanelDashboard } from "@/components/panel/PanelDashboard";
import { getClientSession } from "@/lib/auth/session";
import { getActiveApplicationForClient } from "@/lib/applications";

export const metadata: Metadata = {
  title: "Panel cliente",
  description:
    "Panel basico protegido para seguimiento claro, documentacion organizada y proximos pasos."
};

export default async function ClientPanelPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const activeApplication = await getActiveApplicationForClient(session.userId);

  return <PanelDashboard activeApplication={activeApplication} session={session} />;
}
