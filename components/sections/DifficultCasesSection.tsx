import { Files, History, UsersRound } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PUBLIC_ROUTES } from "@/lib/routes";

const cases = [
  {
    title: "Documentacion incompleta",
    icon: Files
  },
  {
    title: "Procesos anteriores",
    icon: History
  },
  {
    title: "Familias que necesitan organizacion",
    icon: UsersRound
  }
];

export function DifficultCasesSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 rounded-[2rem] border border-border bg-card p-6 shadow-premium backdrop-blur-xl sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
        <div>
          <SectionHeading
            eyebrow="Casos dificiles"
            title="Historias dificiles tambien pueden avanzar."
            description="Hay personas que no saben por donde comenzar, tienen dudas, procesos previos o documentacion incompleta. Cruza Norte ayuda a ordenar la informacion, revisar cada etapa y dar seguimiento claro al proceso."
          />
          <div className="mt-8">
            <ButtonLink href={PUBLIC_ROUTES.contacto}>Solicitar orientacion</ButtonLink>
          </div>
        </div>

        <div className="grid gap-4">
          {cases.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="flex items-center gap-4 rounded-2xl border border-border bg-secondary p-5"
                key={item.title}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="font-semibold text-foreground">{item.title}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
