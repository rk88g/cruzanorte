import type { LucideIcon } from "lucide-react";

type InfoGridItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type InfoGridProps = {
  items: InfoGridItem[];
  columns?: "three" | "four";
};

export function InfoGrid({ items, columns = "three" }: InfoGridProps) {
  return (
    <div
      className={
        columns === "four"
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          : "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            className="rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-premium"
            key={item.title}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-accent">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-xl font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {item.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
