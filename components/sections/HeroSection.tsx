"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, ClipboardCheck, Compass, MessageCircle } from "lucide-react";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PUBLIC_ROUTES } from "@/lib/routes";

const progressItems = [
  "Registro inicial",
  "Informacion organizada",
  "Revision de expediente",
  "Seguimiento claro"
];

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 72]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, -42]);

  return (
    <section
      className="relative overflow-hidden border-b border-border px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
      ref={heroRef}
    >
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary opacity-10 blur-3xl" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
          initial={{ opacity: 0, y: 22 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-soft backdrop-blur-xl">
            <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />
            Proceso guiado y seguimiento claro
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.26em] text-accent">
            Cruza Norte
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Tu camino al norte empieza aqui.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Acompanamiento claro para personas que buscan prepararse mejor,
            organizar su documentacion y dar seguimiento a su proceso paso a paso.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={PUBLIC_ROUTES.registro}>
              Iniciar mi proceso
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href={PUBLIC_ROUTES.comoFunciona} variant="secondary">
              Conocer como funciona
            </ButtonLink>
          </div>
        </motion.div>

        <motion.div className="relative min-h-[34rem] lg:min-h-[38rem]" style={{ y: visualY }}>
          <div className="absolute inset-0 rounded-[2rem] border border-border bg-card shadow-premium backdrop-blur-xl" />
          <div className="absolute inset-5 overflow-hidden rounded-[1.5rem] border border-border bg-secondary">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary opacity-20 blur-3xl" />
            <div className="absolute -bottom-14 left-6 h-48 w-48 rounded-full bg-success opacity-20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--card)_0,transparent_34%),linear-gradient(135deg,transparent_0%,var(--muted)_100%)]" />

            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    Vista previa
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">
                    Avance del proceso
                  </h2>
                </div>
                <Compass className="h-9 w-9 text-accent" aria-hidden="true" />
              </div>

              <div className="my-8 grid gap-4">
                {progressItems.map((item, index) => (
                  <div className="flex items-center gap-4" key={item}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-accent">
                      {index + 1}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${42 + index * 16}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <motion.div
                className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl"
                style={{ y: panelY }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      Documentacion organizada
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Revisa pendientes, etapas y proximos pasos desde una vista
                      clara.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <MessageCircle className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Comunicacion clara
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Preparacion paso a paso
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
