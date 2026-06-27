"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ClipboardList, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import {
  APPLICATION_COUNTRY_OPTIONS,
  PROCESS_REASON_OPTIONS
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { applicationStartSchema } from "@/validations/application";

type ApplicationStartFormValues = {
  main_contact_name: string;
  email: string;
  origin_country: string;
  origin_city: string;
  process_reason: string;
  total_people: number;
  departure_country: string;
  departure_city: string;
  desired_date: string;
  alternative_date: string;
  notes_public: string;
};

type ApplicationStartFormProps = {
  whatsappE164: string;
};

type ApplicationStartResponse = {
  ok: boolean;
  code?: "active_application_exists";
  message?: string;
  redirect_to?: string;
};

const inputClassName =
  "mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClassName =
  "mt-2 min-h-32 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-danger">{message}</p>;
}

export function ApplicationStartForm({ whatsappE164 }: ApplicationStartFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasDuplicateApplication, setHasDuplicateApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<ApplicationStartFormValues>({
    resolver: zodResolver(applicationStartSchema),
    defaultValues: {
      main_contact_name: "",
      email: "",
      origin_country: "",
      origin_city: "",
      process_reason: "",
      total_people: 1,
      departure_country: "",
      departure_city: "",
      desired_date: "",
      alternative_date: "",
      notes_public: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setFormError(null);
    setStatusMessage(null);
    setHasDuplicateApplication(false);

    try {
      const response = await fetch("/api/applications/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const result = (await response.json()) as ApplicationStartResponse;

      if (!response.ok || !result.ok) {
        setFormError(
          result.message ?? "No pudimos iniciar tu registro. Revisa la informacion."
        );
        setHasDuplicateApplication(result.code === "active_application_exists");
        return;
      }

      setStatusMessage("Registro inicial guardado. Volviendo a tu panel...");
      window.location.assign(result.redirect_to ?? "/panel");
    } catch {
      setFormError("No pudimos iniciar tu registro. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Informacion inicial
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Inicia tu registro
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Captura los datos principales para comenzar a organizar tu proceso guiado y
                preparar los siguientes pasos.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                WhatsApp verificado
              </div>
              <p className="mt-2 break-all text-sm text-muted-foreground">{whatsappE164}</p>
            </div>
          </div>
        </div>

        <form
          autoComplete="off"
          className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6"
          onSubmit={onSubmit}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Datos principales</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Mantendremos tu WhatsApp actual como contacto principal. No se modifica desde
                este formulario.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="main_contact_name">
                Nombre completo
              </label>
              <input
                className={cn(
                  inputClassName,
                  errors.main_contact_name &&
                    "border-danger focus:border-danger focus:ring-danger/20"
                )}
                id="main_contact_name"
                placeholder="Nombre y apellidos"
                type="text"
                {...register("main_contact_name")}
              />
              <FieldError message={errors.main_contact_name?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="email">
                Correo electronico
              </label>
              <input
                className={cn(
                  inputClassName,
                  errors.email && "border-danger focus:border-danger focus:ring-danger/20"
                )}
                id="email"
                placeholder="nombre@correo.com"
                type="email"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="origin_country">
                Pais donde te encuentras
              </label>
              <select
                className={cn(
                  inputClassName,
                  errors.origin_country &&
                    "border-danger focus:border-danger focus:ring-danger/20"
                )}
                id="origin_country"
                {...register("origin_country")}
              >
                <option value="">Selecciona una opcion</option>
                {APPLICATION_COUNTRY_OPTIONS.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <FieldError message={errors.origin_country?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="origin_city">
                Ciudad donde te encuentras
              </label>
              <input
                className={cn(
                  inputClassName,
                  errors.origin_city && "border-danger focus:border-danger focus:ring-danger/20"
                )}
                id="origin_city"
                placeholder="Ciudad actual"
                type="text"
                {...register("origin_city")}
              />
              <FieldError message={errors.origin_city?.message} />
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-xl font-semibold text-foreground">Informacion del proceso</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="process_reason">
                  Motivo principal del proceso
                </label>
                <select
                  className={cn(
                    inputClassName,
                    errors.process_reason &&
                      "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="process_reason"
                  {...register("process_reason")}
                >
                  <option value="">Selecciona una opcion</option>
                  {PROCESS_REASON_OPTIONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.process_reason?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="total_people">
                  Numero de personas incluidas
                </label>
                <input
                  className={cn(
                    inputClassName,
                    errors.total_people &&
                      "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="total_people"
                  inputMode="numeric"
                  max={20}
                  min={1}
                  type="number"
                  {...register("total_people", { valueAsNumber: true })}
                />
                <FieldError message={errors.total_people?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="departure_country">
                  Pais de salida
                </label>
                <select
                  className={cn(
                    inputClassName,
                    errors.departure_country &&
                      "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="departure_country"
                  {...register("departure_country")}
                >
                  <option value="">Selecciona una opcion</option>
                  {APPLICATION_COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.departure_country?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="departure_city">
                  Ciudad de salida
                </label>
                <input
                  className={cn(
                    inputClassName,
                    errors.departure_city &&
                      "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="departure_city"
                  placeholder="Ciudad de salida"
                  type="text"
                  {...register("departure_city")}
                />
                <FieldError message={errors.departure_city?.message} />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-xl font-semibold text-foreground">Fechas deseadas</h2>
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="desired_date">
                  Fecha deseada
                </label>
                <input
                  className={cn(
                    inputClassName,
                    errors.desired_date && "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="desired_date"
                  type="date"
                  {...register("desired_date")}
                />
                <FieldError message={errors.desired_date?.message} />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="alternative_date">
                  Fecha alternativa
                </label>
                <input
                  className={cn(
                    inputClassName,
                    errors.alternative_date &&
                      "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="alternative_date"
                  type="date"
                  {...register("alternative_date")}
                />
                <FieldError message={errors.alternative_date?.message} />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <label className="text-sm font-medium text-foreground" htmlFor="notes_public">
              Comentarios iniciales
            </label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Cuentanos brevemente tu situacion para ayudarte a organizar mejor los
              siguientes pasos.
            </p>
            <textarea
              className={cn(
                textareaClassName,
                errors.notes_public && "border-danger focus:border-danger focus:ring-danger/20"
              )}
              id="notes_public"
              maxLength={2000}
              placeholder="Escribe cualquier detalle relevante para la revision inicial."
              {...register("notes_public")}
            />
            <FieldError message={errors.notes_public?.message} />
          </div>

          <div className="mt-6 space-y-3">
            {formError ? (
              <Alert variant="danger">
                <div className="flex flex-col gap-3">
                  <p>{formError}</p>
                  {hasDuplicateApplication ? (
                    <Link className="font-semibold text-foreground underline" href="/panel">
                      Volver a mi panel
                    </Link>
                  ) : null}
                </div>
              </Alert>
            ) : null}

            {statusMessage ? <Alert variant="success">{statusMessage}</Alert> : null}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary sm:w-auto"
              href="/panel"
            >
              Volver a mi panel
            </Link>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Guardando..." : "Guardar e iniciar proceso"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
