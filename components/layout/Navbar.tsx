import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PROJECT } from "@/lib/constants";
import { ADMIN_ROUTES, CLIENT_ROUTES, PUBLIC_NAVIGATION } from "@/lib/routes";

export function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav
        aria-label="Navegacion principal"
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <Link className="flex items-center gap-3 text-graphite" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-graphite text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-tight">{PROJECT.name}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-neutral-700">
          {PUBLIC_NAVIGATION.map((item) => (
            <Link className="transition hover:text-copper" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="font-medium text-graphite transition hover:text-copper" href={CLIENT_ROUTES.panel}>
            Panel
          </Link>
          <Link className="font-medium text-graphite transition hover:text-copper" href={ADMIN_ROUTES.home}>
            ADMIN
          </Link>
        </div>
      </nav>
    </header>
  );
}
