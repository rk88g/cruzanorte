import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ApplicationCriticalAlert } from "@/lib/internal/applicationCards";

type ApplicationCriticalAlertsProps = {
  alerts: ApplicationCriticalAlert[];
};

function getPriorityTone(priority: ApplicationCriticalAlert["priority"]) {
  return priority === "Alta" ? "danger" : "primary";
}

export function ApplicationCriticalAlerts({ alerts }: ApplicationCriticalAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-danger/25 bg-danger/10 p-5 shadow-soft backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-danger/30 bg-background text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-danger">
            Alertas criticas
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Puntos que requieren revision
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {alerts.map((alert) => (
          <article className="rounded-xl border border-border bg-card p-4" key={alert.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
              <StatusBadge tone={getPriorityTone(alert.priority)} value={alert.priority} />
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{alert.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
