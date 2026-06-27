"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CountryCodeSelect } from "@/components/auth/CountryCodeSelect";
import { Alert } from "@/components/ui/Alert";
import { calculateAgeFromBirthDate } from "@/lib/age";
import {
  APPLICATION_COUNTRY_OPTIONS,
  TRAVELER_RELATIONSHIP_OPTIONS
} from "@/lib/constants";
import { buildWhatsappE164 } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { TravelerForClient } from "@/lib/travelers";
import { travelerSchema } from "@/validations/traveler";

export type TravelerFormValues = {
  full_name: string;
  birth_date: string;
  age: number;
  country_origin: string;
  nationality: string;
  relationship: string;
  country_code: string;
  phone_number: string;
  email: string;
  is_main_client: boolean;
  requires_mexico_entry_review: boolean;
  notes: string;
};

type TravelerFormProps = {
  existingTraveler?: TravelerForClient | null;
  isFirstTraveler: boolean;
  onCancel: () => void;
  onSaved: (traveler: TravelerForClient) => void;
};

type TravelerResponse = {
  ok: boolean;
  message?: string;
  traveler?: TravelerForClient;
};

const inputClassName =
  "mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

const textareaClassName =
  "mt-2 min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function getDefaultValues(
  traveler: TravelerForClient | null | undefined,
  isFirstTraveler: boolean
): TravelerFormValues {
  return {
    full_name: traveler?.full_name ?? "",
    birth_date: traveler?.birth_date ?? "",
    age: traveler?.age ?? 0,
    country_origin: traveler?.country_origin ?? "",
    nationality: traveler?.nationality ?? "",
    relationship: traveler?.relationship ?? "",
    country_code: traveler?.country_code ?? "+52",
    phone_number: traveler?.phone_number ?? "",
    email: traveler?.email ?? "",
    is_main_client: traveler?.is_main_client ?? isFirstTraveler,
    requires_mexico_entry_review: traveler?.requires_mexico_entry_review ?? false,
    notes: traveler?.notes ?? ""
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-danger">{message}</p>;
}

export function TravelerForm({
  existingTraveler,
  isFirstTraveler,
  onCancel,
  onSaved
}: TravelerFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValues = useMemo(
    () => getDefaultValues(existingTraveler, isFirstTraveler),
    [existingTraveler, isFirstTraveler]
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue
  } = useForm<TravelerFormValues>({
    resolver: zodResolver(travelerSchema),
    defaultValues
  });

  const birthDate = useWatch({ control, name: "birth_date" });
  const countryCode = useWatch({ control, name: "country_code" });
  const phoneNumber = useWatch({ control, name: "phone_number" });
  const isEditing = Boolean(existingTraveler);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    const calculatedAge = birthDate ? calculateAgeFromBirthDate(birthDate) : null;

    setValue("age", calculatedAge ?? 0, {
      shouldValidate: Boolean(birthDate)
    });
  }, [birthDate, setValue]);

  const whatsappPreview = phoneNumber
    ? buildWhatsappE164(countryCode || "+52", phoneNumber)
    : "Opcional";

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        isEditing && existingTraveler ? `/api/travelers/${existingTraveler.id}` : "/api/travelers",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        }
      );
      const result = (await response.json()) as TravelerResponse;

      if (!response.ok || !result.ok || !result.traveler) {
        setFormError(result.message ?? "No pudimos guardar esta persona.");
        return;
      }

      onSaved(result.traveler);
      reset(getDefaultValues(null, false));
    } catch {
      setFormError("No pudimos guardar esta persona. Intenta nuevamente.");
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {isEditing ? "Editar persona" : "Agregar persona"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Datos de la persona que viaja
          </h2>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary sm:w-auto"
          onClick={onCancel}
          type="button"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="full_name">
            Nombre completo
          </label>
          <input
            className={cn(
              inputClassName,
              errors.full_name && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="full_name"
            placeholder="Nombre y apellidos"
            type="text"
            {...register("full_name")}
          />
          <FieldError message={errors.full_name?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="birth_date">
            Fecha de nacimiento
          </label>
          <input
            className={cn(
              inputClassName,
              errors.birth_date && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="birth_date"
            type="date"
            {...register("birth_date")}
          />
          <FieldError message={errors.birth_date?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="age">
            Edad
          </label>
          <input
            className={cn(
              inputClassName,
              errors.age && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="age"
            inputMode="numeric"
            readOnly
            type="number"
            {...register("age", { valueAsNumber: true })}
          />
          <FieldError message={errors.age?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="country_origin">
            Pais de origen
          </label>
          <select
            className={cn(
              inputClassName,
              errors.country_origin && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="country_origin"
            {...register("country_origin")}
          >
            <option value="">Selecciona una opcion</option>
            {APPLICATION_COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <FieldError message={errors.country_origin?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="nationality">
            Nacionalidad
          </label>
          <select
            className={cn(
              inputClassName,
              errors.nationality && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="nationality"
            {...register("nationality")}
          >
            <option value="">Selecciona una opcion</option>
            {APPLICATION_COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <FieldError message={errors.nationality?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="relationship">
            Parentesco o relacion con el cliente principal
          </label>
          <select
            className={cn(
              inputClassName,
              errors.relationship && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="relationship"
            {...register("relationship")}
          >
            <option value="">Selecciona una opcion</option>
            {TRAVELER_RELATIONSHIP_OPTIONS.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
          <FieldError message={errors.relationship?.message} />
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">WhatsApp del viajero</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Si esta persona tiene WhatsApp propio, captura codigo de pais y numero nacional.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="country_code">
              Codigo de pais
            </label>
            <div className="mt-2">
              <CountryCodeSelect
                className={cn(errors.country_code && "border-danger")}
                id="country_code"
                {...register("country_code")}
              />
            </div>
            <FieldError message={errors.country_code?.message} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="phone_number">
              Numero de WhatsApp
            </label>
            <input
              className={cn(
                inputClassName,
                errors.phone_number && "border-danger focus:border-danger focus:ring-danger/20"
              )}
              id="phone_number"
              inputMode="numeric"
              maxLength={15}
              pattern="[0-9]*"
              placeholder="5519876543"
              type="text"
              {...register("phone_number")}
            />
            <FieldError message={errors.phone_number?.message} />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
          WhatsApp normalizado:{" "}
          <span className="font-semibold text-foreground">{whatsappPreview}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 border-t border-border pt-6 lg:grid-cols-2">
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
            placeholder="correo@ejemplo.com"
            type="email"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4">
          <label className="flex items-start gap-3 text-sm font-medium text-foreground">
            <input className="mt-1" type="checkbox" {...register("is_main_client")} />
            Esta persona es el cliente principal
          </label>
          <label className="flex items-start gap-3 text-sm font-medium text-foreground">
            <input
              className="mt-1"
              type="checkbox"
              {...register("requires_mexico_entry_review")}
            />
            Requiere revision para entrada a Mexico
          </label>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-foreground" htmlFor="notes">
          Notas adicionales
        </label>
        <textarea
          className={cn(
            textareaClassName,
            errors.notes && "border-danger focus:border-danger focus:ring-danger/20"
          )}
          id="notes"
          maxLength={2000}
          placeholder="Agrega detalles utiles para el seguimiento del proceso."
          {...register("notes")}
        />
        <FieldError message={errors.notes?.message} />
      </div>

      {formError ? (
        <div className="mt-5">
          <Alert variant="danger">{formError}</Alert>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={isSubmitting}
          type="submit"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Guardando..." : "Guardar persona"}
        </button>
      </div>
    </form>
  );
}
