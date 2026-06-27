import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { TravelersList } from "@/components/panel/TravelersList";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getClientSession } from "@/lib/auth/session";
import { CLIENT_ROUTES } from "@/lib/routes";
import { getTravelerSetupForClient } from "@/lib/travelers";

export const metadata: Metadata = {
  title: "Personas que viajan",
  description:
    "Modulo para agregar y revisar las personas incluidas en el proceso guiado."
};

export default async function ClientTravelersPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const { activeApplication, travelers } = await getTravelerSetupForClient(session.userId);

  if (!activeApplication) {
    return (
      <section className="px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Personas que viajan
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Primero debes iniciar tu registro.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Primero debes iniciar tu registro para agregar personas a tu proceso.
          </p>
          <div className="mt-6">
            <ButtonLink href={CLIENT_ROUTES.registro}>Iniciar registro</ButtonLink>
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
            Informacion inicial
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Personas que viajan
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Has agregado {travelers.length} de {activeApplication.total_people} personas
                incluidas en tu proceso.
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
              Avance actual: {activeApplication.progress}%
            </div>
          </div>
        </div>

        <TravelersList activeApplication={activeApplication} initialTravelers={travelers} />
      </div>
    </section>
  );
}
