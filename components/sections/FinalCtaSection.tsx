import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PUBLIC_ROUTES } from "@/lib/routes";

export function FinalCtaSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto overflow-hidden rounded-[2rem] border border-border bg-card p-8 text-center shadow-premium backdrop-blur-xl sm:p-12 lg:max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Comienza con orden
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Da el primer paso con claridad.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          Comienza tu registro y recibe una guia ordenada para conocer tus proximos
          pasos.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={PUBLIC_ROUTES.registro}>
            Iniciar mi proceso
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href={PUBLIC_ROUTES.ingresar} variant="secondary">
            Entrar con WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
