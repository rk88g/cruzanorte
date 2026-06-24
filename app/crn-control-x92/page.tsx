import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InternalApplicationsTable } from "@/components/internal/InternalApplicationsTable";
import { InternalShell } from "@/components/internal/InternalShell";
import { InternalStatsCards } from "@/components/internal/InternalStatsCards";
import { getInternalDashboardData } from "@/lib/internal/queries";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

export const metadata: Metadata = {
  title: "Panel interno",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalDashboardPage() {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const dashboard = await getInternalDashboardData();

  return (
    <InternalShell
      title="Panel interno"
      description="Vista general solo lectura de clientes registrados, solicitudes y avance del proceso."
    >
      <div className="space-y-6">
        <InternalStatsCards
          activeApplications={dashboard.activeApplications}
          completedApplications={dashboard.completedApplications}
          pausedApplications={dashboard.pausedApplications}
          totalApplications={dashboard.totalApplications}
          totalClients={dashboard.totalClients}
        />

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Ultimas solicitudes creadas
            </h2>
          </div>
          <InternalApplicationsTable applications={dashboard.latestApplications} />
        </section>
      </div>
    </InternalShell>
  );
}
