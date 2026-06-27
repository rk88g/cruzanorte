import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvailableDatesList } from "@/components/panel/AvailableDatesList";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getClientSession } from "@/lib/auth/session";
import { getClientDateRequestSetup } from "@/lib/availableDates";
import { CLIENT_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Fechas disponibles",
  description:
    "Modulo privado para revisar fechas disponibles y solicitar una fecha para revision."
};

function RequirementCard({
  actionHref,
  actionLabel,
  description,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <section className="px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Fechas disponibles
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
        {actionHref && actionLabel ? (
          <div className="mt-6">
            <ButtonLink href={actionHref}>{actionLabel}</ButtonLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default async function ClientDateRequestPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const { activeApplication, availableDates } = await getClientDateRequestSetup(session.userId);

  if (!activeApplication) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.registro}
        actionLabel="Iniciar registro"
        description="Primero debes iniciar tu registro para solicitar una fecha."
        title="Primero debes iniciar tu registro."
      />
    );
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.personas}
        actionLabel="Agregar personas"
        description="Antes de solicitar fecha, agrega a todas las personas incluidas en tu proceso."
        title="Completa las personas que viajan."
      />
    );
  }

  if (!activeApplication.receiving_contact_exists) {
    return (
      <RequirementCard
        actionHref={CLIENT_ROUTES.contactoRecibe}
        actionLabel="Agregar contacto"
        description="Antes de solicitar fecha, agrega la informacion del contacto que recibe."
        title="Agrega el contacto que recibe."
      />
    );
  }

  if (activeApplication.requested_date_status === "approved") {
    return (
      <RequirementCard
        actionLabel="Disponible proximamente"
        description="Tu fecha fue autorizada. El siguiente paso sera la documentacion."
        title="Fecha autorizada"
      />
    );
  }

  return (
    <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <ClientProcessTimeline
          currentStage={activeApplication.current_stage}
          progress={activeApplication.progress}
        />

        <div className="my-6 rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Fechas disponibles
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Solicita una fecha
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Elige una fecha disponible para enviarla a revision. El cupo se descuenta solo
                cuando la fecha sea autorizada por el equipo interno.
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Avance actual: {activeApplication.progress}%
            </div>
          </div>
        </div>

        {activeApplication.requested_date_status === "requested" ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground">Fecha en revision</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Tu fecha fue enviada para revision. Te avisaremos cuando sea autorizada.
            </p>
            <div className="mt-5">
              <ButtonLink href={CLIENT_ROUTES.panel} variant="secondary">
                Volver al panel
              </ButtonLink>
            </div>
          </div>
        ) : null}

        {activeApplication.requested_date_status === "rejected" ? (
          <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-5 shadow-soft">
            <h2 className="text-xl font-semibold text-foreground">Selecciona otra fecha</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              La fecha anterior no fue autorizada. Puedes solicitar otra fecha disponible.
            </p>
          </div>
        ) : null}

        {activeApplication.requested_date_status !== "requested" ? (
          <>
            <AvailableDatesList availableDates={availableDates} />

            <div className="mt-6">
              <ButtonLink href={CLIENT_ROUTES.panel} variant="secondary">
                Volver al panel
              </ButtonLink>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
