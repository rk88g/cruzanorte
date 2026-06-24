import { CheckCircle2, FileText, PauseCircle, UsersRound, Activity } from "lucide-react";

type InternalStatsCardsProps = {
  activeApplications: number;
  completedApplications: number;
  pausedApplications: number;
  totalApplications: number;
  totalClients: number;
};

const statConfig = [
  {
    key: "totalClients",
    label: "Clientes registrados",
    icon: UsersRound
  },
  {
    key: "totalApplications",
    label: "Solicitudes",
    icon: FileText
  },
  {
    key: "activeApplications",
    label: "Solicitudes activas",
    icon: Activity
  },
  {
    key: "pausedApplications",
    label: "Solicitudes pausadas",
    icon: PauseCircle
  },
  {
    key: "completedApplications",
    label: "Solicitudes completadas",
    icon: CheckCircle2
  }
] as const;

export function InternalStatsCards(props: InternalStatsCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {statConfig.map((item) => (
        <article
          className="rounded-2xl border border-border bg-card p-4 shadow-soft backdrop-blur-xl"
          key={item.key}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <item.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-3xl font-semibold text-foreground">{props[item.key]}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
        </article>
      ))}
    </section>
  );
}
