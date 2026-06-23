import { CreditCard, FileText, MessageSquareText, Route, UserRound, ClipboardList } from "lucide-react";
import type { ClientSession } from "@/lib/auth/session";

const panelItems = [
  {
    title: "Iniciar registro",
    description: "Preparar informacion inicial para el proceso guiado.",
    icon: ClipboardList
  },
  {
    title: "Revisar documentacion",
    description: "Espacio reservado para documentos y pendientes.",
    icon: FileText
  },
  {
    title: "Linea de tiempo",
    description: "Vista futura para consultar avance del proceso.",
    icon: Route
  },
  {
    title: "Pagos",
    description: "Modulo reservado para pagos por etapa.",
    icon: CreditCard
  },
  {
    title: "Mensajes",
    description: "Comunicacion organizada con el equipo.",
    icon: MessageSquareText
  },
  {
    title: "Mi perfil",
    description: "Datos basicos y telefono WhatsApp de la cuenta.",
    icon: UserRound
  }
];

type PanelDashboardProps = {
  session: ClientSession;
};

export function PanelDashboard({ session }: PanelDashboardProps) {
  return (
    <section className="px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-premium backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Panel cliente
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
              Bienvenido a Cruza Norte.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
              Aqui podras dar seguimiento a tu proceso, revisar proximos pasos y mantener
              tu informacion organizada.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-5">
            <p className="text-sm text-muted-foreground">WhatsApp registrado</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{session.whatsapp_e164}</p>
            <p className="mt-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Cuenta activa
            </p>
            <form action="/api/auth/logout" className="mt-6" method="post">
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary"
                type="submit"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {panelItems.map((item) => (
            <article
              className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl"
              key={item.title}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
