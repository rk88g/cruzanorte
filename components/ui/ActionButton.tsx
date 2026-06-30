import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: "primary" | "secondary";
};

export function ActionButton({
  children,
  className,
  icon,
  variant = "secondary",
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-soft transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-accent"
          : "border border-border bg-background text-foreground hover:border-primary hover:text-primary",
        className
      )}
      type="button"
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
