import type { ReactNode } from "react";

type InternalHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function InternalHero({
  eyebrow,
  title,
  description,
  children
}: InternalHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary opacity-10 blur-3xl" />
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
        <div className="relative z-10 max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>

        <div className="relative z-10">{children}</div>
      </div>
    </section>
  );
}
