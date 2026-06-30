import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { DocumentsPanel } from "@/components/panel/DocumentsPanel";
import { PaymentCommitmentsPanel } from "@/components/panel/PaymentCommitmentsPanel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getClientSession } from "@/lib/auth/session";
import { getClientDocumentationSetup } from "@/lib/documents";
import { getClientPaymentsForApplication } from "@/lib/payments";
import { CLIENT_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Documentacion",
  description:
    "Modulo privado para subir documentos, revisar estados y mantener el proceso organizado."
};

function RequirementCard({
  actionHref,
  actionLabel,
  description,
  title
}: {
  actionHref: string;
  actionLabel: string;
  description: string;
  title: string;
}) {
  return (
    <section className="px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Documentacion
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
        <div className="mt-6">
          <ButtonLink href={actionHref}>{actionLabel}</ButtonLink>
        </div>
      </div>
    </section>
  );
}

export default async function ClientDocumentationPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const {
    activeApplication,
    documentationStageState,
    generalRequirements,
    mexicoSections,
    summary,
    travelerSections
  } = await getClientDocumentationSetup(session.userId);

  if (!activeApplication) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.registro}
        actionLabel="Iniciar registro"
        description="Primero debes iniciar tu registro para subir documentacion."
        title="Primero debes iniciar tu registro."
      />
    );
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.personas}
        actionLabel="Agregar personas"
        description="Antes de subir documentacion, agrega a todas las personas incluidas en tu proceso."
        title="Completa las personas que viajan."
      />
    );
  }

  if (!activeApplication.receiving_contact_exists) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.contactoRecibe}
        actionLabel="Agregar contacto"
        description="Antes de subir documentacion, agrega el contacto que recibe."
        title="Agrega el contacto que recibe."
      />
    );
  }

  if (!activeApplication.requested_date_id && !activeApplication.approved_date_id) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.fecha}
        actionLabel="Solicitar fecha"
        description="Antes de subir documentacion, solicita una fecha disponible."
        title="Solicita una fecha disponible."
      />
    );
  }

  if (!summary) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.panel}
        actionLabel="Volver al panel"
        description="No pudimos preparar la documentacion en este momento."
        title="Documentacion no disponible."
      />
    );
  }

  const payments = await getClientPaymentsForApplication(session.userId, activeApplication.id);

  return (
    <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <ClientProcessTimeline
          currentStage={activeApplication.current_stage}
          progress={activeApplication.progress}
        />

        <div className="my-6 rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Documentacion
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Documentacion
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {documentationStageState.is_after_documentation
                  ? "Consulta documentos cargados, reemplazos solicitados y compromisos pendientes relacionados con tu proceso."
                  : "Sube la documentacion solicitada para mantener tu proceso organizado. Cada archivo sera revisado y podras ver su estado desde este panel."}
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Avance actual: {activeApplication.progress}%
            </div>
          </div>
        </div>

        <DocumentsPanel
          applicationId={activeApplication.id}
          documentationStageState={documentationStageState}
          generalRequirements={generalRequirements}
          mexicoSections={mexicoSections}
          summary={summary}
          travelerSections={travelerSections}
        />

        <div className="mt-6">
          <PaymentCommitmentsPanel payments={payments} />
        </div>

        <div className="mt-6">
          <ButtonLink href={CLIENT_ROUTES.panel} variant="secondary">
            Volver al panel
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
