import { FileSearch, FolderCheck, PenLine, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

const steps = [
  {
    title: "Inicias tu registro",
    description: "Comienzas con informacion basica y un canal de contacto claro.",
    icon: PenLine
  },
  {
    title: "Organizas tu informacion",
    description: "Reunes datos y documentos en una estructura facil de revisar.",
    icon: FolderCheck
  },
  {
    title: "Revisamos tu documentacion",
    description: "Identificamos puntos pendientes, incompletos o que requieren atencion.",
    icon: FileSearch
  },
  {
    title: "Das seguimiento a tu avance",
    description: "Consultas etapas, pendientes y proximos pasos del proceso.",
    icon: TrendingUp
  }
];

export function HowItWorksSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Como funciona"
          title="Preparacion paso a paso, con orden desde el inicio."
          description="Cruza Norte organiza el proceso en etapas faciles de entender para que cada persona pueda avanzar con mayor claridad."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                className="rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-premium"
                key={step.title}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-accent">
                    0{index + 1}
                  </span>
                  <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
