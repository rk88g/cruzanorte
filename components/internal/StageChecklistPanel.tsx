import { CheckCircle2, CircleDashed } from "lucide-react";
import type { ApplicationStageChecklistItem } from "@/lib/internal/applicationDetail";
import { cn } from "@/lib/utils";

type StageChecklistPanelProps = {
  items: ApplicationStageChecklistItem[];
};

export function StageChecklistPanel({ items }: StageChecklistPanelProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Checklist interno
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Seguimiento de etapa
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Lista interna de revision para mantener el seguimiento ordenado sin exponer
          instrucciones operativas al cliente.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {items.map((item) => {
          const Icon = item.completed ? CheckCircle2 : CircleDashed;

          return (
            <article
              className="rounded-xl border border-border bg-background/60 p-4"
              key={item.id}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
                    item.completed
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-primary/30 bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-semibold",
                        item.completed
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-background text-muted-foreground"
                      )}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
