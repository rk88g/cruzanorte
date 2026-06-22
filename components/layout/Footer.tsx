import Link from "next/link";
import { PROJECT } from "@/lib/constants";
import { LEGAL_NAVIGATION, PUBLIC_NAVIGATION } from "@/lib/routes";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold">{PROJECT.name}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Servicio profesional de acompanamiento, documentacion y seguimiento.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm text-muted-foreground lg:items-end">
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {PUBLIC_NAVIGATION.map((item) => (
              <Link className="transition hover:text-primary" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {LEGAL_NAVIGATION.map((item) => (
              <Link className="transition hover:text-primary" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
