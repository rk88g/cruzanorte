import { CreditCard, FileText, MessageSquareText, UserRound, ClipboardList } from "lucide-react";
import Link from "next/link";
import type { ClientActiveApplication } from "@/lib/applications";
import { CLIENT_ROUTES } from "@/lib/routes";
import { getClientStageOverviewContent, isDocumentationStageOpen } from "@/lib/stages";

const QUICK_ACTIONS = [
  {
    title: "Documentacion",
    description: "Archivos y pendientes por revisar.",
    icon: FileText
  },
  {
    title: "Pagos",
    description: "Pagos por etapa y comprobantes.",
    icon: CreditCard
  },
  {
    title: "Mensajes",
    description: "Comunicacion organizada con el equipo.",
    icon: MessageSquareText
  },
  {
    title: "Mi perfil",
    description: "Datos basicos de la cuenta.",
    icon: UserRound
  }
];

type QuickActionsProps = {
  activeApplication: ClientActiveApplication | null;
};

export function QuickActions({ activeApplication }: QuickActionsProps) {
  const travelersAreComplete = activeApplication
    ? activeApplication.travelers_count >= activeApplication.total_people
    : false;
  const receivingContactIsComplete = Boolean(activeApplication?.receiving_contact_exists);
  const hasDate = Boolean(activeApplication?.requested_date_id || activeApplication?.approved_date_id);
  const hasApprovedDate = activeApplication?.requested_date_status === "approved";
  const isAfterDocumentation =
    activeApplication ? !isDocumentationStageOpen(activeApplication.current_stage) : false;
  const stageOverview = activeApplication
    ? getClientStageOverviewContent(activeApplication.current_stage)
    : null;
  const firstActionHref = !activeApplication
    ? CLIENT_ROUTES.registro
    : isAfterDocumentation
      ? CLIENT_ROUTES.llegadaOficina
      : !travelersAreComplete
      ? CLIENT_ROUTES.personas
      : !receivingContactIsComplete
        ? CLIENT_ROUTES.contactoRecibe
        : hasApprovedDate
          ? CLIENT_ROUTES.documentacion
        : CLIENT_ROUTES.contactoRecibe;
  const resolvedFirstActionHref =
    activeApplication && !isAfterDocumentation && travelersAreComplete && receivingContactIsComplete && !hasApprovedDate
      ? CLIENT_ROUTES.fecha
      : firstActionHref;
  const firstActionTitle = !activeApplication
    ? "Iniciar registro"
    : isAfterDocumentation
      ? (stageOverview?.title ?? "Etapa actual")
      : !travelersAreComplete
      ? "Agregar personas"
      : !receivingContactIsComplete
        ? "Contacto que recibe"
        : hasApprovedDate
          ? "Documentacion"
          : "Fechas disponibles";
  const firstActionDescription = !activeApplication
    ? "Informacion inicial del proceso guiado."
    : isAfterDocumentation
      ? (stageOverview?.statusLabel ?? "Seguimiento activo")
      : !travelersAreComplete
      ? "Personas incluidas en el proceso guiado."
      : !receivingContactIsComplete
        ? "Informacion del destino aproximado."
        : hasApprovedDate
          ? "Archivos y estados de revision."
          : "Solicita una fecha para revision.";

  return (
    <section className="mt-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Accesos rapidos
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">Herramientas del proceso</h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          className="flex min-h-32 flex-col items-start rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:border-primary"
          href={resolvedFirstActionHref}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="mt-4 text-sm font-semibold text-foreground">{firstActionTitle}</span>
          <span className="mt-1 text-xs leading-5 text-muted-foreground">
            {firstActionDescription}
          </span>
        </Link>

        {QUICK_ACTIONS.filter(
          (item) => !(item.title === "Documentacion" && firstActionTitle === "Documentacion")
        ).map((item) => {
          const isDocumentation = item.title === "Documentacion";
          const content = (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="mt-4 text-sm font-semibold text-foreground">{item.title}</span>
              <span className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.description}
              </span>
            </>
          );

          if (isDocumentation && hasDate) {
            return (
              <Link
                className="flex min-h-32 flex-col items-start rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition hover:border-primary"
                href={CLIENT_ROUTES.documentacion}
                key={item.title}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              className="flex min-h-32 flex-col items-start rounded-2xl border border-border bg-card p-4 text-left shadow-soft opacity-80 transition hover:border-primary disabled:cursor-not-allowed"
              disabled
              key={item.title}
              type="button"
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}
