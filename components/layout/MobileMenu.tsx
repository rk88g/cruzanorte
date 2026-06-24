"use client";

import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CLIENT_ROUTES, PUBLIC_NAVIGATION, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  isClientAuthenticated: boolean;
};

export function MobileMenu({ isClientAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition hover:border-primary hover:text-primary"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-overlay backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        aria-label="Menu movil"
        aria-hidden={!isOpen}
        aria-modal={isOpen}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-border bg-background p-5 shadow-premium transition-transform duration-300",
          isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
        )}
        id={menuId}
        inert={!isOpen}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Menu
          </p>
          <button
            aria-label="Cerrar menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Navegacion movil"
          className="mt-8 grid gap-2 text-base text-foreground"
        >
          {PUBLIC_NAVIGATION.map((item) => (
            <Link
              className="rounded-lg border border-transparent px-4 py-3 transition hover:border-border hover:bg-card"
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto grid gap-3 pt-8">
          <ThemeToggle />
          {isClientAuthenticated ? (
            <>
              <ButtonLink
                href={CLIENT_ROUTES.panel}
                onClick={() => setIsOpen(false)}
                variant="secondary"
              >
                Mi panel
              </ButtonLink>
              <form action="/api/auth/logout" method="post">
                <button
                  className={cn(
                    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition",
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
              <ButtonLink href={PUBLIC_ROUTES.registro} onClick={() => setIsOpen(false)}>
                Iniciar mi proceso
              </ButtonLink>
              <ButtonLink
                href={PUBLIC_ROUTES.ingresar}
                onClick={() => setIsOpen(false)}
                variant="secondary"
              >
                Entrar
              </ButtonLink>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
