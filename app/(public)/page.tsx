import { ArrowRight, FileCheck2, MessagesSquare, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PUBLIC_ROUTES } from "@/lib/routes";

const highlights = [
  {
    title: "Proceso guiado",
    description: "Orientacion profesional para organizar cada etapa con claridad.",
    icon: ShieldCheck
  },
  {
    title: "Documentacion",
    description: "Revision ordenada de informacion y archivos requeridos.",
    icon: FileCheck2
  },
  {
    title: "Seguimiento",
    description: "Comunicacion cuidadosa sobre el avance del proceso.",
    icon: MessagesSquare
  }
];

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-copper">
          Cruza Norte
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-graphite sm:text-5xl lg:text-6xl">
          Acompanamiento profesional para procesos de documentacion y seguimiento.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-700 sm:text-lg">
          Plataforma en preparacion para organizar servicios, comunicacion y avance
          del proceso con una experiencia clara, seria y confiable.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={PUBLIC_ROUTES.ingresar}>
            Ingresar con WhatsApp
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href={PUBLIC_ROUTES.servicios} variant="secondary">
            Ver servicios
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="rounded-lg border border-neutral-200 bg-white p-6 shadow-soft"
              key={item.title}
            >
              <Icon className="mb-5 h-6 w-6 text-copper" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-graphite">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
