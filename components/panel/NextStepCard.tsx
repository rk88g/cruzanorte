import { ArrowRight, Clock3 } from "lucide-react";
import type { ApplicationStage } from "@/types/database";

type NextStepCardProps = {
  currentStage: ApplicationStage;
};

type NextStepContent = {
  title: string;
  description: string;
  actionLabel: string;
};

const NEXT_STEP_BY_STAGE: Record<ApplicationStage, NextStepContent> = {
  bienvenida: {
    title: "Inicia tu registro",
    description:
      "Completa tu informacion inicial para que el equipo pueda revisar los datos de contacto y el contexto del proceso.",
    actionLabel: "Comenzar registro"
  },
  informacion_inicial: {
    title: "Confirma tu informacion",
    description:
      "Revisa que tus datos esten completos y preparados para el seguimiento de la siguiente etapa.",
    actionLabel: "Revisar informacion"
  },
  fecha_solicitada: {
    title: "Da seguimiento a la fecha solicitada",
    description:
      "Mantente atento a la revision de disponibilidad y a las indicaciones del equipo.",
    actionLabel: "Ver solicitud"
  },
  fecha_autorizada: {
    title: "Prepara la siguiente etapa",
    description:
      "Organiza los datos necesarios para avanzar con documentacion y revision de expediente.",
    actionLabel: "Ver preparacion"
  },
  documentacion: {
    title: "Carga tu documentacion",
    description:
      "Reune los documentos solicitados y conserva archivos claros para su revision profesional.",
    actionLabel: "Ir a documentacion"
  },
  revision_expediente: {
    title: "Atiende la revision del expediente",
    description:
      "El equipo revisara la informacion disponible y podra solicitar ajustes o datos adicionales.",
    actionLabel: "Ver revision"
  },
  preparacion_viaje: {
    title: "Revisa la preparacion de viaje",
    description:
      "Consulta proximas indicaciones y prepara cada elemento con orden antes de la fecha definida.",
    actionLabel: "Ver preparacion"
  },
  llegada_oficina: {
    title: "Confirma llegada a oficina",
    description:
      "Sigue las indicaciones operativas para tu llegada y conserva tus datos de contacto actualizados.",
    actionLabel: "Ver indicaciones"
  },
  acompanamiento_programado: {
    title: "Consulta el acompanamiento programado",
    description:
      "Revisa el seguimiento asignado y los puntos de comunicacion para esta etapa del proceso.",
    actionLabel: "Ver acompanamiento"
  },
  en_destino: {
    title: "Actualiza tu llegada",
    description:
      "Comparte la informacion necesaria para cerrar el seguimiento operativo de esta fase.",
    actionLabel: "Actualizar estado"
  },
  bienvenido: {
    title: "Servicio finalizado",
    description:
      "Tu proceso aparece como finalizado. Conserva tus documentos y comunicaciones importantes.",
    actionLabel: "Ver resumen"
  }
};

export function NextStepCard({ currentStage }: NextStepCardProps) {
  const content = NEXT_STEP_BY_STAGE[currentStage];

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
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground opacity-70 shadow-premium sm:w-auto"
          disabled
          type="button"
        >
          {content.actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          Disponible proximamente
        </span>
      </div>
    </article>
  );
}
