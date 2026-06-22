"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const options = [
  {
    theme: "light",
    label: "Claro",
    icon: Sun
  },
  {
    theme: "dark",
    label: "Oscuro",
    icon: Moon
  }
];

type ThemeToggleProps = {
  compact?: boolean;
  iconOnly?: boolean;
};

export function ThemeToggle({ compact = false, iconOnly = false }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-11 rounded-full border border-border bg-card",
          iconOnly ? "w-11" : "w-[5.75rem]"
        )}
      />
    );
  }

  if (iconOnly) {
    const currentTheme = resolvedTheme === "light" ? "light" : "dark";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    const Icon = currentTheme === "light" ? Sun : Moon;

    return (
      <button
        aria-label={`Tema actual ${currentTheme}. Cambiar a modo ${nextTheme}`}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-accent shadow-soft transition hover:border-primary hover:text-foreground"
        onClick={() => setTheme(nextTheme)}
        title={`Cambiar a modo ${nextTheme}`}
        type="button"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      aria-label="Selector de tema"
      className={cn(
        "inline-flex h-11 items-center rounded-full border border-border bg-card p-1 shadow-soft backdrop-blur-xl",
        compact ? "w-[5.75rem]" : "w-full sm:w-[8.5rem]"
      )}
      role="group"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = resolvedTheme === option.theme;

        return (
          <button
            aria-label={`Cambiar a modo ${option.label.toLowerCase()}`}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-xs font-semibold transition",
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={option.theme}
            onClick={() => setTheme(option.theme)}
            title={`Modo ${option.label.toLowerCase()}`}
            type="button"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {!compact && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
