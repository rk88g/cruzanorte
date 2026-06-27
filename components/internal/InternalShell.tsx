import {
  BarChart3,
  CalendarDays,
  FileText,
  FolderOpen,
  LogOut,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";

const INTERNAL_NAVIGATION = [
  {
    label: "Resumen",
    href: INTERNAL_ROUTES.base,
    icon: BarChart3
  },
  {
    label: "Solicitudes",
    href: INTERNAL_ROUTES.applications,
    icon: FileText
  },
  {
    label: "Fechas",
    href: INTERNAL_ROUTES.dates,
    icon: CalendarDays
  },
  {
    label: "Documentos",
    href: INTERNAL_ROUTES.documents,
    icon: FolderOpen
  },
  {
    label: "Clientes",
    href: INTERNAL_ROUTES.clients,
    icon: UsersRound
  }
];

type InternalShellProps = {
  children: ReactNode;
  description?: string;
  title: string;
};

export function InternalShell({ children, description, title }: InternalShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background/82 shadow-soft backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link className="flex items-center gap-3" href={INTERNAL_ROUTES.base}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-soft">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Control Cruza Norte
              </span>
              <span className="block text-xs text-muted-foreground">Panel interno</span>
            </span>
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav
              aria-label="Navegacion interna"
              className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1"
            >
              {INTERNAL_NAVIGATION.map((item) => (
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground"
                  href={item.href}
                  key={item.href}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle iconOnly />
              <form action="/api/internal/logout" autoComplete="off" method="post">
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary"
                  type="submit"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesion
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Panel interno
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {children}
      </main>
    </div>
  );
}
