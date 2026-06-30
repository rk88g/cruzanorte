import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApplicationCardsBoard } from "@/components/internal/ApplicationCardsBoard";
import { ApplicationCriticalAlerts } from "@/components/internal/ApplicationCriticalAlerts";
import { ApplicationDetailHeader } from "@/components/internal/ApplicationDetailHeader";
import { ApplicationStageControl } from "@/components/internal/ApplicationStageControl";
import { ApplicationSummaryStrip } from "@/components/internal/ApplicationSummaryStrip";
import { ApplicationTimelineBar } from "@/components/internal/ApplicationTimelineBar";
import { InternalShell } from "@/components/internal/InternalShell";
import { buildApplicationCards } from "@/lib/internal/applicationCards";
import { getInternalApplicationDetail } from "@/lib/internal/queries";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";
import { getPaymentsForApplication } from "@/lib/payments";

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

  const payments = await getPaymentsForApplication(application.id);
  const blockingPayments = payments.filter(
    (payment) => payment.blocks_progress && payment.status !== "paid"
  );
  const cardsBoard = buildApplicationCards(application, payments);

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
        <ApplicationCriticalAlerts alerts={cardsBoard.alerts} />
        <ApplicationSummaryStrip items={cardsBoard.summary} />
        <ApplicationStageControl
          applicationId={application.id}
          blockingPayments={blockingPayments}
          currentStage={application.current_stage}
        />
        <ApplicationCardsBoard
          applicationId={application.id}
          board={cardsBoard}
          travelers={application.travelers}
        />
      </div>
    </InternalShell>
  );
}
