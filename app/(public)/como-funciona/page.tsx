import type { Metadata } from "next";
import {
  Bell,
  FileStack,
  FolderCheck,
  MessageSquareText,
  PenLine,
  UsersRound
} from "lucide-react";
import { FaqList } from "@/components/sections/FaqList";
import { InfoGrid } from "@/components/sections/InfoGrid";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";

const pageDescription =
  "Descubre como Cruza Norte organiza cada proceso por etapas para dar seguimiento claro a informacion, documentacion y proximos pasos.";

export const metadata: Metadata = {
  title: "Como funciona",
  description: pageDescription,
  alternates: {
    canonical: "/como-funciona"
  }
};

const steps = [
  {
    title: "Inicias tu registro",
    description: "Comienzas con informacion basica para abrir tu proceso.",
    icon: PenLine
  },
  {
    title: "Compartes tu informacion",
    description: "Agregas datos importantes para conocer el punto de partida.",
    icon: MessageSquareText
  },
  {
    title: "Agregas a las personas incluidas",
    description: "Organizas a familiares o acompanantes cuando el caso lo requiere.",
    icon: UsersRound
  },
  {
    title: "Organizas tu documentacion",
    description: "Reunes archivos y pendientes en una estructura clara.",
    icon: FolderCheck
  },
  {
    title: "Das seguimiento a tu avance",
    description: "Revisas etapas, pendientes y proximos pasos del proceso.",
    icon: FileStack
  },
  {
    title: "Recibes actualizaciones del proceso",
    description: "Mantienes una comunicacion clara sobre cambios y solicitudes.",
    icon: Bell
  }
];

const panelItems = [
  {
    title: "Pendientes visibles",
    description:
      "El cliente puede revisar que informacion falta y que documentos requieren atencion.",
    icon: FileStack
  },
  {
    title: "Avance por etapas",
    description:
      "Cada proceso se organiza en pasos para entender el estado general.",
    icon: FolderCheck
  },
  {
    title: "Comunicacion ordenada",
    description:
      "Las actualizaciones se presentan con lenguaje claro y profesional.",
    icon: MessageSquareText
  }
];

const quickQuestions = [
  {
    question: "El registro ya es funcional?",
    answer:
      "En esta fase solo existe una pantalla placeholder. El flujo real se construira despues."
  },
  {
    question: "Se conecta con WhatsApp?",
    answer:
      "La verificacion por WhatsApp esta contemplada para fases posteriores; todavia no se envia ningun codigo real."
  },
  {
    question: "Puedo ver documentos reales?",
    answer:
      "Todavia no. La documentacion y el almacenamiento se integraran en una fase futura."
  }
];

const timeline = [
  "Registro",
  "Informacion",
  "Personas incluidas",
  "Documentacion",
  "Revision",
  "Seguimiento"
];

export default function HowItWorksPage() {
  return (
    <>
      <InternalHero
        eyebrow="Como funciona"
        title="Cada proceso se organiza por etapas claras."
        description="Cada proceso se organiza por etapas para que el cliente pueda conocer que informacion falta, que documentos estan pendientes y cual es el siguiente paso."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Pasos generales"
            title="Un recorrido simple para preparar mejor tu informacion."
          />
          <div className="mt-10">
            <InfoGrid items={steps} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-border bg-card p-6 shadow-premium backdrop-blur-xl sm:p-8">
          <SectionHeading
            eyebrow="Linea de tiempo"
            title="Una vista resumida del avance."
            description="La linea de tiempo ayuda a identificar en que punto se encuentra el proceso y que falta por completar."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {timeline.map((item, index) => (
              <div className="rounded-2xl border border-border bg-secondary p-4" key={item}>
                <span className="text-xs font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Panel del cliente"
            title="Que vera el cliente en su panel."
            description="El panel privado se construira por fases, con una experiencia enfocada en seguimiento claro y documentacion organizada."
          />
          <div className="mt-10">
            <InfoGrid items={panelItems} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Preguntas rapidas"
            title="Lo que debes saber en esta etapa."
          />
          <FaqList items={quickQuestions} />
        </div>
      </section>

      <PageCta
        title="Conoce tus proximos pasos con claridad."
        description="Comienza con un registro inicial y prepara tu informacion de manera ordenada."
      />
    </>
  );
}
