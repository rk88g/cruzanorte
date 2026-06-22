import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  children,
  href,
  onClick,
  variant = "primary"
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-premium hover:bg-accent",
        variant === "secondary" &&
          "border border-border bg-card text-foreground shadow-soft backdrop-blur hover:border-primary"
      )}
      href={href}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
