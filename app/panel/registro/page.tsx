import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApplicationStartForm } from "@/components/forms/ApplicationStartForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getClientSession } from "@/lib/auth/session";
import { getActiveApplicationForClient } from "@/lib/applications";
import { CLIENT_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Iniciar registro",
  description:
    "Formulario inicial para organizar datos principales, seguimiento claro y proximos pasos."
};

export default async function ClientRegistrationPage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/ingresar");
  }

  const activeApplication = await getActiveApplicationForClient(session.userId);

  if (activeApplication) {
    return (
      <section className="px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center shadow-premium backdrop-blur-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Proceso iniciado
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            Ya tienes un proceso iniciado.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Puedes continuar desde tu panel y revisar el avance del proceso. En una fase
            futura habilitaremos multiples solicitudes por cliente.
          </p>
          <div className="mt-6">
            <ButtonLink href={CLIENT_ROUTES.panel}>Volver a mi panel</ButtonLink>
          </div>
        </div>
      </section>
    );
  }

  return <ApplicationStartForm whatsappE164={session.whatsapp_e164} />;
}
