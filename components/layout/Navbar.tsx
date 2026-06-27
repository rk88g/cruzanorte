import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getClientSession } from "@/lib/auth/session";
import { PROJECT } from "@/lib/constants";
import { CLIENT_ROUTES, DESKTOP_NAVIGATION, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export async function Navbar() {
  const session = await getClientSession();
  const isClientAuthenticated = Boolean(session);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background shadow-soft backdrop-blur-xl">
      <nav
        aria-label="Navegacion principal"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8"
      >
        <Link className="flex items-center gap-3 text-foreground" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-premium">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">{PROJECT.name}</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {DESKTOP_NAVIGATION.map((item) => (
            <Link className="transition hover:text-primary" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle compact />
          {isClientAuthenticated ? (
            <>
              <ButtonLink href={CLIENT_ROUTES.panel} variant="secondary">
                Mi panel
              </ButtonLink>
              <form action="/api/auth/logout" autoComplete="off" method="post">
                <button
                  className={cn(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-soft backdrop-blur transition",
                    "hover:border-primary hover:text-primary"
                  )}
                  type="submit"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesion
                </button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href={PUBLIC_ROUTES.ingresar} variant="secondary">
                Entrar
              </ButtonLink>
              <ButtonLink href={PUBLIC_ROUTES.registro}>Iniciar mi proceso</ButtonLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle iconOnly />
          <MobileMenu isClientAuthenticated={isClientAuthenticated} />
        </div>
      </nav>
    </header>
  );
}
