import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PUBLIC_ROUTES } from "@/lib/routes";

const stages = [
  "Bienvenida",
  "Informacion inicial",
  "Fecha solicitada",
  "Documentacion",
  "Revision de expediente",
  "Preparacion",
  "En destino",
  "Bienvenido"
];

export function TimelinePreviewSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Linea de avance"
              title="Una vista clara de etapas, pendientes y proximos pasos."
              description="Tu proceso se muestra por etapas para que puedas revisar avances, pendientes y proximos pasos desde tu panel."
            />
            <div className="mt-8">
              <ButtonLink href={PUBLIC_ROUTES.comoFunciona} variant="secondary">
                Ver como funciona
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-7">
            <div className="mb-8 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[68%] rounded-full bg-primary" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {stages.map((stage, index) => (
                <div
                  className="relative rounded-2xl border border-border bg-secondary p-4"
                  key={stage}
                >
                  <span className="text-xs font-semibold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-3 text-sm font-semibold leading-6 text-foreground">
                    {stage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
