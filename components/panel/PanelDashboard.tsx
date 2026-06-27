import { AccountSummaryCard } from "@/components/panel/AccountSummaryCard";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { NextStepCard } from "@/components/panel/NextStepCard";
import { PaymentCommitmentsPanel } from "@/components/panel/PaymentCommitmentsPanel";
import { QuickActions } from "@/components/panel/QuickActions";
import type { ClientActiveApplication } from "@/lib/applications";
import type { ClientSession } from "@/lib/auth/session";
import type { PaymentCommitment } from "@/lib/payments";
import {
  APPLICATION_STAGES,
  DEFAULT_APPLICATION_PROGRESS,
  DEFAULT_APPLICATION_STAGE
} from "@/lib/constants";

type PanelDashboardProps = {
  activeApplication: ClientActiveApplication | null;
  payments: PaymentCommitment[];
  session: ClientSession;
};

export function PanelDashboard({
  activeApplication,
  payments,
  session
}: PanelDashboardProps) {
  const currentStage = activeApplication?.current_stage ?? DEFAULT_APPLICATION_STAGE;
  const currentProgress = activeApplication?.progress ?? DEFAULT_APPLICATION_PROGRESS;
  const currentStageLabel =
    APPLICATION_STAGES.find((stage) => stage.slug === currentStage)?.label ?? "Bienvenida";

  return (
    <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Panel cliente
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Bienvenido a Cruza Norte.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Consulta el avance del proceso, revisa el siguiente paso y conserva tu
              informacion organizada en un solo lugar.
            </p>
          </div>
          <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-soft backdrop-blur-xl sm:w-auto">
            <p className="text-xs text-muted-foreground">Etapa actual</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{currentStageLabel}</p>
          </div>
        </div>

        <ClientProcessTimeline currentStage={currentStage} progress={currentProgress} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <NextStepCard activeApplication={activeApplication} />
          <AccountSummaryCard session={session} />
        </div>

        <QuickActions activeApplication={activeApplication} />

        <div className="mt-6">
          <PaymentCommitmentsPanel payments={payments} />
        </div>
      </div>
    </section>
  );
}
