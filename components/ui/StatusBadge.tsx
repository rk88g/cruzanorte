import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  tone?: "danger" | "default" | "primary" | "success" | "warning";
  value: string;
};

const toneClassNames = {
  danger: "border-danger/30 bg-danger/10 text-danger",
  default: "border-border bg-background text-muted-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-accent/30 bg-accent/10 text-accent"
} as const;

export function StatusBadge({ tone = "default", value }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold",
        toneClassNames[tone]
      )}
    >
      {value}
    </span>
  );
}
