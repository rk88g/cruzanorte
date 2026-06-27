import { LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import type { ClientSession } from "@/lib/auth/session";

type AccountSummaryCardProps = {
  session: ClientSession;
};

export function AccountSummaryCard({ session }: AccountSummaryCardProps) {
  return (
    <aside className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
        Cuenta
      </p>

      <div className="mt-5 grid gap-4">
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-primary">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="mt-3 text-xs text-muted-foreground">WhatsApp registrado</p>
          <p className="mt-1 break-all text-base font-semibold text-foreground">
            {session.whatsapp_e164}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Cuenta activa</p>
            <p className="text-xs text-muted-foreground">Sesion de cliente verificada.</p>
          </div>
        </div>
      </div>

      <form action="/api/auth/logout" autoComplete="off" className="mt-5" method="post">
        <button
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary"
          type="submit"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesion
        </button>
      </form>
    </aside>
  );
}
