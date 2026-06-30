"use client";

import { Check, ChevronDown, Circle } from "lucide-react";
import { useState } from "react";
import { APPLICATION_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ApplicationStage } from "@/types/database";

type ApplicationTimelineBarProps = {
  currentStage: ApplicationStage;
  progress: number;
};

function clampProgress(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export function ApplicationTimelineBar({ currentStage, progress }: ApplicationTimelineBarProps) {
  const [showMobileStages, setShowMobileStages] = useState(false);
  const currentIndex = Math.max(
    APPLICATION_STAGES.findIndex((stage) => stage.slug === currentStage),
    0
  );
  const normalizedProgress = clampProgress(progress);
  const currentStageConfig = APPLICATION_STAGES[currentIndex];
  const nextStageConfig = APPLICATION_STAGES[currentIndex + 1] ?? null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Avance de proceso
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Linea de tiempo de la solicitud
          </h2>
        </div>
        <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {normalizedProgress}% completado
        </span>
      </div>

      <div className="mt-6 lg:hidden">
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Etapa actual
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {currentStageConfig?.label ?? currentStage}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Siguiente: {nextStageConfig?.label ?? "Proceso finalizado"}
              </p>
            </div>
            <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {normalizedProgress}%
            </span>
          </div>
          <button
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary"
            onClick={() => setShowMobileStages((value) => !value)}
            type="button"
          >
            {showMobileStages ? "Ocultar etapas" : "Ver todas las etapas"}
            <ChevronDown
              className={cn("h-4 w-4 transition", showMobileStages ? "rotate-180" : "")}
              aria-hidden="true"
            />
          </button>
        </div>

        {showMobileStages ? (
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">
            {APPLICATION_STAGES.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <li
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex min-w-0 gap-3 rounded-xl border p-3",
                    isCurrent
                      ? "border-primary/45 bg-primary/10"
                      : "border-border bg-background/50"
                  )}
                  key={stage.slug}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      isCompleted || isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Circle className="h-3 w-3" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{stage.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stage.progress}%</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>

      <div className="relative mt-7 hidden lg:block">
        <div className="absolute left-0 right-0 top-5 h-px bg-border" />
        <div
          className="absolute left-0 top-5 h-px rounded-full bg-primary"
          style={{ width: `${normalizedProgress}%` }}
        />
        <ol className="relative grid grid-cols-11 gap-2">
          {APPLICATION_STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <li
                aria-current={isCurrent ? "step" : undefined}
                className="min-w-0 text-center"
                key={stage.slug}
              >
                <span
                  className={cn(
                    "mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold shadow-soft",
                    isCompleted || isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className="mt-3 block text-[0.7rem] font-semibold leading-4 text-foreground">
                  {stage.label}
                </span>
                <span className="mt-1 block text-[0.68rem] text-muted-foreground">
                  {stage.progress}%
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
