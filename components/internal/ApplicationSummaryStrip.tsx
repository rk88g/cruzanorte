import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ApplicationSummaryStripItem } from "@/lib/internal/applicationCards";

type ApplicationSummaryStripProps = {
  items: ApplicationSummaryStripItem[];
};

function getTone(status: string) {
  if (status.includes("Pendiente") || status.includes("Requiere")) {
    return "primary" as const;
  }

  if (status.includes("Completo") || status.includes("Autorizada") || status.includes("Sin pendiente")) {
    return "success" as const;
  }

  return "default" as const;
}

export function ApplicationSummaryStrip({ items }: ApplicationSummaryStripProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft backdrop-blur-xl">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((item) => (
          <div className="rounded-xl border border-border bg-background/60 p-3" key={item.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-foreground">{item.value}</p>
            <div className="mt-2">
              <StatusBadge tone={getTone(item.status)} value={item.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
