"use client";

import { ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Alert } from "@/components/ui/Alert";

type InternalLoginResponse = {
  ok: boolean;
  message?: string;
  redirect_to?: string;
};

export function InternalLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/internal/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const result = (await response.json()) as InternalLoginResponse;

      if (!response.ok || !result.ok) {
        setFormError(result.message ?? "No pudimos validar el acceso interno.");
        return;
      }

      window.location.assign(result.redirect_to ?? "/crn-control-x92");
    } catch {
      setFormError("No pudimos validar el acceso interno.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-premium backdrop-blur-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <ThemeToggle iconOnly />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Control Cruza Norte
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Panel interno</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Ingresa con las credenciales internas configuradas para revisar clientes y
          solicitudes en modo solo lectura.
        </p>

        <form autoComplete="off" className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="internal_email">
              Correo
            </label>
            <input
              autoComplete="off"
              className="mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="internal_email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@empresa.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="internal_password">
              Contrasena
            </label>
            <input
              autoComplete="off"
              className="mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              id="internal_password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contrasena interna"
              required
              type="password"
              value={password}
            />
          </div>

          {formError ? <Alert variant="danger">{formError}</Alert> : null}

          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Validando..." : "Entrar al panel interno"}
          </button>
        </form>
      </div>
    </section>
  );
}
