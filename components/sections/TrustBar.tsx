import { ClipboardList, MessageSquareText, Route, UserRoundCheck } from "lucide-react";

const items = [
  {
    label: "Atencion personalizada",
    icon: UserRoundCheck
  },
  {
    label: "Documentacion organizada",
    icon: ClipboardList
  },
  {
    label: "Seguimiento por etapas",
    icon: Route
  },
  {
    label: "Comunicacion clara",
    icon: MessageSquareText
  }
];

export function TrustBar() {
  return (
    <section className="px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-3 rounded-2xl border border-border bg-card p-3 shadow-premium backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4" key={item.label}>
              <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
