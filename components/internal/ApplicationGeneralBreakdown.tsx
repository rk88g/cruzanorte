import type {
  ApplicationBreakdownItem,
  BreakdownStatus
} from "@/lib/internal/applicationDetail";
import { cn } from "@/lib/utils";

type ApplicationGeneralBreakdownProps = {
  items: ApplicationBreakdownItem[];
};

const statusClassNames: Record<BreakdownStatus, string> = {
  Autorizado: "border-success/30 bg-success/10 text-success",
  Completo: "border-success/30 bg-success/10 text-success",
  "En revision": "border-primary/30 bg-primary/10 text-primary",
  "No aplica": "border-border bg-background text-muted-foreground",
  Pendiente: "border-border bg-background text-muted-foreground",
  Proximamente: "border-border bg-background text-muted-foreground",
  Rechazado: "border-danger/30 bg-danger/10 text-danger",
  "Requiere accion": "border-danger/30 bg-danger/10 text-danger"
};

export function ApplicationGeneralBreakdown({ items }: ApplicationGeneralBreakdownProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Desglose general
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Estado resumido por area
        </h2>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            className="rounded-xl border border-border bg-background/60 p-4"
            key={item.area}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-sm font-semibold text-foreground">{item.area}</h3>
              <span
                className={cn(
                  "w-fit rounded-full border px-3 py-1 text-xs font-semibold",
                  statusClassNames[item.status]
                )}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
