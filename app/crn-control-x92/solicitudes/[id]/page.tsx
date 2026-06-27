import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApplicationDetailHeader } from "@/components/internal/ApplicationDetailHeader";
import { ApplicationDetailSections } from "@/components/internal/ApplicationDetailSections";
import { ApplicationGeneralBreakdown } from "@/components/internal/ApplicationGeneralBreakdown";
import { ApplicationPendingItemsTable } from "@/components/internal/ApplicationPendingItemsTable";
import { InternalShell } from "@/components/internal/InternalShell";
import {
  buildApplicationGeneralBreakdown,
  buildApplicationPendingItems
} from "@/lib/internal/applicationDetail";
import { getInternalApplicationDetail } from "@/lib/internal/queries";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

type InternalApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle de solicitud",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalApplicationDetailPage({
  params
}: InternalApplicationDetailPageProps) {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const { id } = await params;
  const application = await getInternalApplicationDetail(id);

  if (!application) {
    notFound();
  }

  const breakdownItems = buildApplicationGeneralBreakdown(application);
  const pendingItems = buildApplicationPendingItems(application);

  return (
    <InternalShell
      title="Detalle de solicitud"
      description="Vista resumida de avance, pendientes y datos completos organizados."
    >
      <div className="space-y-6">
        <Link
          className="inline-flex text-sm font-semibold text-primary transition hover:text-accent"
          href={INTERNAL_ROUTES.applications}
        >
          Volver a solicitudes
        </Link>

        <ApplicationDetailHeader application={application} />
        <ApplicationGeneralBreakdown items={breakdownItems} />
        <ApplicationPendingItemsTable items={pendingItems} />
        <ApplicationDetailSections application={application} />
      </div>
    </InternalShell>
  );
}
