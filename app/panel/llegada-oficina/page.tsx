import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { PaymentCommitmentsPanel } from "@/components/panel/PaymentCommitmentsPanel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getActiveApplicationForClient } from "@/lib/applications";
import { getClientApplicationDateSummary } from "@/lib/availableDates";
import { getClientSession } from "@/lib/auth/session";
import { getClientPaymentsForApplication } from "@/lib/payments";
import { getReceivingContactForApplication } from "@/lib/receivingContact";
import { CLIENT_ROUTES } from "@/lib/routes";
import { getClientStageOverviewContent } from "@/lib/stages";
import { getTravelersForApplication } from "@/lib/travelers";

export const metadata: Metadata = {
  title: "Etapa actual",
  description:
    "Vista privada para revisar la etapa actual, personas incluidas y compromisos pendientes."
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha registrada";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(new Date(value));
}

export default async function ClientOfficeArrivalPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const activeApplication = await getActiveApplicationForClient(session.userId);

  if (!activeApplication) {
    redirect(CLIENT_ROUTES.panel);
  }

  const [applicationDate, payments, receivingContact, travelers] = await Promise.all([
    getClientApplicationDateSummary(session.userId, activeApplication.id),
    getClientPaymentsForApplication(session.userId, activeApplication.id),
    getReceivingContactForApplication(activeApplication.id),
    getTravelersForApplication(activeApplication.id)
  ]);
  const stageContent = getClientStageOverviewContent(activeApplication.current_stage);

  return (
    <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <ClientProcessTimeline
          currentStage={activeApplication.current_stage}
          progress={activeApplication.progress}
        />

        <div className="my-6 rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Etapa actual
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {stageContent.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {stageContent.description}
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Avance actual: {activeApplication.progress}%
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Recepcion y seguimiento
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoItem label="Estado" value={stageContent.statusLabel} />
              <InfoItem label="Fecha" value={formatDate(applicationDate?.date)} />
              <InfoItem
                label="Ciudad / base"
                value={applicationDate?.location_city ?? "Sin ciudad registrada"}
              />
              <InfoItem
                label="Personas incluidas"
                value={`${travelers.length} de ${activeApplication.total_people}`}
              />
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Indicaciones generales
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li>Revisa esta vista para confirmar la etapa actual de tu proceso.</li>
                <li>Mantente atento a los mensajes y actualizaciones del equipo.</li>
                <li>Conserva tu informacion organizada para cualquier revision posterior.</li>
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Grupo y mensajes
            </p>
            <div className="mt-5 space-y-3">
              {travelers.map((traveler) => (
                <div
                  className="rounded-xl border border-border bg-background/60 p-4"
                  key={traveler.id}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {traveler.full_name || "Persona registrada"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {traveler.relationship} / {traveler.nationality}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Mensajes importantes
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {activeApplication.requested_date_notes ??
                  receivingContact?.notes ??
                  "Sin mensajes adicionales por el momento."}
              </p>
            </div>
          </section>
        </div>

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
