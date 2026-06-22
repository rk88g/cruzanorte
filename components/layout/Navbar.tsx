import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PROJECT } from "@/lib/constants";
import { CLIENT_ROUTES, PUBLIC_NAVIGATION } from "@/lib/routes";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 shadow-soft backdrop-blur-xl">
      <nav
        aria-label="Navegacion principal"
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <Link className="flex items-center gap-3 text-foreground" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-premium">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">{PROJECT.name}</span>
        </Link>

        <div className="grid w-full grid-cols-2 gap-x-5 gap-y-3 text-sm text-muted-foreground sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          {PUBLIC_NAVIGATION.map((item) => (
            <Link className="transition hover:text-primary" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="font-medium text-foreground transition hover:text-primary" href={CLIENT_ROUTES.panel}>
            Mi proceso
          </Link>
        </div>
      </nav>
    </header>
  );
}
