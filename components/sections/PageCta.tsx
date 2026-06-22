import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PUBLIC_ROUTES } from "@/lib/routes";

type PageCtaProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function PageCta({
  eyebrow = "Siguiente paso",
  title,
  description,
  primaryLabel = "Iniciar mi proceso",
  primaryHref = PUBLIC_ROUTES.registro,
  secondaryLabel = "Entrar con WhatsApp",
  secondaryHref = PUBLIC_ROUTES.ingresar
}: PageCtaProps) {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto rounded-[2rem] border border-border bg-card p-8 text-center shadow-premium backdrop-blur-xl sm:p-12 lg:max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={primaryHref}>
            {primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
