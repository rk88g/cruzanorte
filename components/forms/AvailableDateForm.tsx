"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import {
  AVAILABLE_DATE_LOCATION_OPTIONS,
  AVAILABLE_DATE_OTHER_LOCATION_VALUE,
  AVAILABLE_DATE_STATUS_LABELS,
  AVAILABLE_DATE_STATUSES
} from "@/lib/constants";
import { getInternalDateDetailRoute, INTERNAL_ROUTES } from "@/lib/internal/routes";
import { cn } from "@/lib/utils";
import type { InternalAvailableDate } from "@/lib/availableDates";
import { availableDateFormSchema } from "@/validations/availableDate";

type AvailableDateFormValues = {
  capacity_available: number;
  capacity_total: number;
  custom_location_city: string;
  date: string;
  location_city: string;
  notes_internal: string;
  status: (typeof AVAILABLE_DATE_STATUSES)[number];
};

type AvailableDateFormProps = {
  availableDate?: InternalAvailableDate | null;
  mode: "create" | "edit";
};

type AvailableDateResponse = {
  available_date?: InternalAvailableDate;
  message?: string;
  ok: boolean;
};

const inputClassName =
  "mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-danger">{message}</p>;
}

function getLocationDefaults(availableDate?: InternalAvailableDate | null) {
  const location = availableDate?.location_city ?? "";
  const knownLocation = AVAILABLE_DATE_LOCATION_OPTIONS.find((option) => option === location);

  if (knownLocation && knownLocation !== AVAILABLE_DATE_OTHER_LOCATION_VALUE) {
    return {
      location_city: knownLocation,
      custom_location_city: ""
    };
  }

  if (location) {
    return {
      location_city: AVAILABLE_DATE_OTHER_LOCATION_VALUE,
      custom_location_city: location
    };
  }

  return {
    location_city: "",
    custom_location_city: ""
  };
}

export function AvailableDateForm({ availableDate, mode }: AvailableDateFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const locationDefaults = useMemo(() => getLocationDefaults(availableDate), [availableDate]);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register
  } = useForm<AvailableDateFormValues>({
    resolver: zodResolver(availableDateFormSchema),
    defaultValues: {
      capacity_available: availableDate?.capacity_available ?? 1,
      capacity_total: availableDate?.capacity_total ?? 1,
      custom_location_city: locationDefaults.custom_location_city,
      date: availableDate?.date ?? "",
      location_city: locationDefaults.location_city,
      notes_internal: availableDate?.notes_internal ?? "",
      status: availableDate?.status ?? "available"
    }
  });
  const locationCity = useWatch({ control, name: "location_city" });
  const showCustomLocation = locationCity === AVAILABLE_DATE_OTHER_LOCATION_VALUE;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        mode === "edit" && availableDate
          ? `/api/internal/dates/${availableDate.id}`
          : "/api/internal/dates",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        }
      );
      const result = (await response.json()) as AvailableDateResponse;

      if (!response.ok || !result.ok || !result.available_date) {
        setFormError(result.message ?? "No pudimos guardar la fecha.");
        return;
      }

      setStatusMessage("Fecha guardada correctamente.");
      window.location.assign(getInternalDateDetailRoute(result.available_date.id));
    } catch {
      setFormError("No pudimos guardar la fecha. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form
      autoComplete="off"
      className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6"
      onSubmit={onSubmit}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Fechas disponibles
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          {mode === "edit" ? "Editar fecha" : "Nueva fecha"}
        </h2>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="date">
            Fecha
          </label>
          <input
            className={cn(
              inputClassName,
              errors.date && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="date"
            type="date"
            {...register("date")}
          />
          <FieldError message={errors.date?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="location_city">
            Ciudad o base
          </label>
          <select
            className={cn(
              inputClassName,
              errors.location_city && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="location_city"
            {...register("location_city")}
          >
            <option value="">Selecciona una opcion</option>
            {AVAILABLE_DATE_LOCATION_OPTIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <FieldError message={errors.location_city?.message} />
        </div>

        {showCustomLocation ? (
          <div className="lg:col-span-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="custom_location_city"
            >
              Especifica ciudad o base
            </label>
            <input
              className={cn(
                inputClassName,
                errors.custom_location_city &&
                  "border-danger focus:border-danger focus:ring-danger/20"
              )}
              id="custom_location_city"
              placeholder="Ciudad o base"
              type="text"
              {...register("custom_location_city")}
            />
            <FieldError message={errors.custom_location_city?.message} />
          </div>
        ) : null}

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="capacity_total">
            Cupo total
          </label>
          <input
            className={cn(
              inputClassName,
              errors.capacity_total && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="capacity_total"
            min={1}
            type="number"
            {...register("capacity_total", { valueAsNumber: true })}
          />
          <FieldError message={errors.capacity_total?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="capacity_available">
            Cupo disponible
          </label>
          <input
            className={cn(
              inputClassName,
              errors.capacity_available &&
                "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="capacity_available"
            min={0}
            type="number"
            {...register("capacity_available", { valueAsNumber: true })}
          />
          <FieldError message={errors.capacity_available?.message} />
        </div>

        <div className="lg:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="status">
            Estado
          </label>
          <select
            className={cn(
              inputClassName,
              errors.status && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="status"
            {...register("status")}
          >
            {AVAILABLE_DATE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {AVAILABLE_DATE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <FieldError message={errors.status?.message} />
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-foreground" htmlFor="notes_internal">
          Notas internas
        </label>
        <textarea
          className={cn(
            textareaClassName,
            errors.notes_internal && "border-danger focus:border-danger focus:ring-danger/20"
          )}
          id="notes_internal"
          placeholder="Notas visibles solo para el panel privado."
          {...register("notes_internal")}
        />
        <FieldError message={errors.notes_internal?.message} />
      </div>

      {formError ? (
        <div className="mt-5">
          <Alert variant="danger">{formError}</Alert>
        </div>
      ) : null}

      {statusMessage ? (
        <div className="mt-5">
          <Alert>{statusMessage}</Alert>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <a
          className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary"
          href={INTERNAL_ROUTES.dates}
        >
          Volver a fechas
        </a>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Guardando..." : "Guardar fecha"}
        </button>
      </div>
    </form>
  );
}
