import type { LucideIcon } from "lucide-react";

type ContactCardProps = {
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

export function ContactCard({
  title,
  description,
  detail,
  icon: Icon
}: ContactCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl">
      <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
      <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
      <p className="mt-5 text-sm font-semibold text-accent">{detail}</p>
    </article>
  );
}
