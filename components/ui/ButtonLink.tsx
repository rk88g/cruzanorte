import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  children,
  href,
  variant = "primary"
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-graphite text-white shadow-soft hover:bg-neutral-800",
        variant === "secondary" &&
          "border border-neutral-300 bg-white text-graphite hover:border-neutral-400"
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
