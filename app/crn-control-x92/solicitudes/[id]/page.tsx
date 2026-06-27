import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApplicationDetailHeader } from "@/components/internal/ApplicationDetailHeader";
import { ApplicationStageControl } from "@/components/internal/ApplicationStageControl";
import { ApplicationTimelineBar } from "@/components/internal/ApplicationTimelineBar";
import { ApplicationUnifiedTable } from "@/components/internal/ApplicationUnifiedTable";
import { InternalShell } from "@/components/internal/InternalShell";
import { buildApplicationUnifiedRows } from "@/lib/internal/applicationDetail";
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

  const unifiedRows = buildApplicationUnifiedRows(application);

  return (
    <InternalShell
      title="Detalle de solicitud"
      description="Centro operativo interno para revisar avance, documentacion y acciones de la solicitud."
    >
      <div className="space-y-6">
        <Link
          className="inline-flex text-sm font-semibold text-primary transition hover:text-accent"
          href={INTERNAL_ROUTES.applications}
        >
          Volver a solicitudes
        </Link>

        <ApplicationDetailHeader application={application} />
        <ApplicationTimelineBar
          currentStage={application.current_stage}
          progress={application.progress}
        />
        <ApplicationStageControl
          applicationId={application.id}
          currentStage={application.current_stage}
        />
        <ApplicationUnifiedTable
          applicationId={application.id}
          requestedDateStatus={application.requested_date_status}
          rows={unifiedRows}
        />
      </div>
    </InternalShell>
  );
}
