import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PUBLIC_ROUTES } from "@/lib/routes";

type ServiceDetailCardProps = {
  title: string;
  description: string;
  benefits: string[];
  icon: LucideIcon;
};

export function ServiceDetailCard({
  title,
  description,
  benefits,
  icon: Icon
}: ServiceDetailCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-premium">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-accent">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
      <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
        {benefits.map((benefit) => (
          <li className="flex gap-2" key={benefit}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {benefit}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <ButtonLink href={PUBLIC_ROUTES.registro}>Iniciar mi proceso</ButtonLink>
      </div>
    </article>
  );
}
