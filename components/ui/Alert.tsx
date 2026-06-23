import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  variant?: "info" | "success" | "danger";
};

export function Alert({ children, className, title, variant = "info" }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4 text-sm shadow-soft backdrop-blur-xl",
        variant === "info" && "border-primary/35 bg-primary/10 text-foreground",
        variant === "success" && "border-success/35 bg-success/10 text-foreground",
        variant === "danger" && "border-danger/40 bg-danger/10 text-danger",
        className
      )}
      role={variant === "danger" ? "alert" : "status"}
    >
      {title ? <p className="font-semibold text-foreground">{title}</p> : null}
      <div className={cn(title && "mt-2")}>{children}</div>
    </div>
  );
}
