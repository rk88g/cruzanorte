import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { ReceivingContactManager } from "@/components/panel/ReceivingContactManager";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getClientSession } from "@/lib/auth/session";
import { getReceivingContactSetupForClient } from "@/lib/receivingContact";
import { CLIENT_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Contacto que recibe",
  description:
    "Modulo para registrar la informacion del contacto que recibe en Estados Unidos."
};

export default async function ReceivingContactPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const { activeApplication, cities, contact, states } =
    await getReceivingContactSetupForClient(session.userId);

  if (!activeApplication) {
    return (
      <section className="px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Contacto que recibe
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Primero debes iniciar tu registro.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Primero debes iniciar tu registro para agregar el contacto que recibe.
          </p>
          <div className="mt-6">
            <ButtonLink href={CLIENT_ROUTES.registro}>Iniciar registro</ButtonLink>
          </div>
        </div>
      </section>
    );
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return (
      <section className="px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Contacto que recibe
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Completa primero las personas que viajan.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Antes de continuar, agrega a todas las personas incluidas en tu proceso.
          </p>
          <div className="mt-6">
            <ButtonLink href={CLIENT_ROUTES.personas}>Agregar personas</ButtonLink>
          </div>
        </div>
      </section>
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
            Informacion del destino
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Contacto que recibe
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Agrega los datos de la persona que recibira al grupo en Estados Unidos. Esta
                informacion nos ayuda a organizar mejor el destino y mantener los datos del
                proceso completos.
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Avance actual: {activeApplication.progress}%
            </div>
          </div>
        </div>

        <ReceivingContactManager cities={cities} initialContact={contact} states={states} />

        <div className="mt-6">
          <ButtonLink href={CLIENT_ROUTES.panel} variant="secondary">
            Volver al panel
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
