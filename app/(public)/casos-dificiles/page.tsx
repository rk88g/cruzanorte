import type { Metadata } from "next";
import { AlertCircle, FileWarning, FolderCheck, HelpCircle, ShieldQuestion, UsersRound } from "lucide-react";
import { InfoGrid } from "@/components/sections/InfoGrid";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PUBLIC_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Casos dificiles",
  description:
    "Acompanamiento para personas que necesitan organizar informacion, documentacion y seguimiento en procesos complejos."
};

const caseTypes = [
  {
    title: "Documentacion incompleta",
    description: "Cuando faltan archivos, datos o comprobantes que requieren revision.",
    icon: FileWarning
  },
  {
    title: "Procesos anteriores",
    description: "Situaciones con historial previo que necesitan orden y contexto.",
    icon: AlertCircle
  },
  {
    title: "Dudas sobre requisitos",
    description: "Preguntas que deben revisarse antes de preparar la informacion.",
    icon: HelpCircle
  },
  {
    title: "Familias con varias personas",
    description: "Casos donde conviene organizar datos y documentos de cada integrante.",
    icon: UsersRound
  },
  {
    title: "Casos sensibles",
    description: "Informacion que requiere trato cuidadoso y seguimiento profesional.",
    icon: ShieldQuestion
  },
  {
    title: "Sin punto de partida claro",
    description: "Personas que no saben por donde comenzar y necesitan estructura.",
    icon: FolderCheck
  }
];

const benefits = [
  {
    title: "Orden documental",
    description:
      "La informacion organizada ayuda a identificar faltantes y puntos de atencion.",
    icon: FolderCheck
  },
  {
    title: "Revision por etapas",
    description:
      "Cada avance se revisa paso a paso para evitar una experiencia confusa.",
    icon: ShieldQuestion
  },
  {
    title: "Seguimiento claro",
    description:
      "La comunicacion se enfoca en pendientes, avances y proximas acciones.",
    icon: HelpCircle
  }
];

export default function ComplexCasesPage() {
  return (
    <>
      <InternalHero
        eyebrow="Casos dificiles"
        title="Historias dificiles tambien pueden avanzar."
        description="Historias dificiles tambien pueden avanzar cuando la informacion se organiza correctamente y el proceso se revisa paso a paso."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card p-8 shadow-premium backdrop-blur-xl">
          <p className="text-lg leading-8 text-muted-foreground">
            Hay personas con dudas, documentacion incompleta, procesos anteriores o
            situaciones familiares complejas. Cruza Norte no promete soluciones
            absolutas; se enfoca en acompanar, ordenar informacion y dar seguimiento
            claro.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Revision cuidadosa"
            title="Tipos de casos que pueden necesitar mas orden."
          />
          <div className="mt-10">
            <InfoGrid items={caseTypes} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Beneficios"
            title="Ordenar la informacion cambia la forma de revisar el proceso."
          />
          <div className="mt-10">
            <InfoGrid items={benefits} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto rounded-[2rem] border border-border bg-secondary p-8 shadow-premium lg:max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Bloque de confianza
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-foreground">
            Un caso complejo necesita cuidado, no promesas.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            El enfoque de Cruza Norte es revisar informacion, preparar documentos,
            identificar pendientes y mantener una comunicacion profesional.
          </p>
        </div>
      </section>

      <PageCta
        title="Solicita orientacion con informacion clara."
        description="Comparte tu punto de partida para organizar los siguientes pasos de manera responsable."
        primaryLabel="Solicitar orientacion"
        primaryHref={PUBLIC_ROUTES.contacto}
      />
    </>
  );
}
