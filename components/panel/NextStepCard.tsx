import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import type { ClientActiveApplication } from "@/lib/applications";
import { CLIENT_ROUTES } from "@/lib/routes";

type NextStepCardProps = {
  activeApplication: ClientActiveApplication | null;
};

type NextStepContent = {
  actionHref?: string;
  actionLabel: string;
  description: string;
  title: string;
};

function getNextStepContent(
  activeApplication: ClientActiveApplication | null
): NextStepContent {
  if (!activeApplication) {
    return {
      title: "Inicia tu registro",
      description: "Completa tu informacion inicial para comenzar a organizar tu proceso.",
      actionLabel: "Comenzar registro",
      actionHref: CLIENT_ROUTES.registro
    };
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return {
      title: "Agrega las personas que viajan",
      description: "Completa la informacion de las personas incluidas en tu proceso.",
      actionLabel: "Agregar personas",
      actionHref: CLIENT_ROUTES.personas
    };
  }

  if (!activeApplication.receiving_contact_exists) {
    return {
      title: "Agrega el contacto que recibe",
      description:
        "Registra la informacion de la persona que recibira al grupo en Estados Unidos.",
      actionLabel: "Agregar contacto",
      actionHref: CLIENT_ROUTES.contactoRecibe
    };
  }

  return {
    title: "Fecha solicitada",
    description:
      "El siguiente paso sera seleccionar una fecha disponible para tu proceso.",
    actionLabel: "Disponible proximamente"
  };
}

export function NextStepCard({ activeApplication }: NextStepCardProps) {
  const content = getNextStepContent(activeApplication);

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Siguiente paso
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">{content.title}</h2>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
          <Clock3 className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        {content.description}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {content.actionHref ? (
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent sm:w-auto"
            href={content.actionHref}
          >
            {content.actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground opacity-70 shadow-premium sm:w-auto"
            disabled
            type="button"
          >
            {content.actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
