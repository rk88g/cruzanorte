"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { CountryCodeSelect } from "@/components/auth/CountryCodeSelect";
import { Alert } from "@/components/ui/Alert";
import {
  RECEIVING_CONTACT_RELATIONSHIP_OPTIONS,
  US_CITY_OTHER_VALUE
} from "@/lib/constants";
import { buildWhatsappE164 } from "@/lib/phone";
import type {
  ReceivingContactForClient,
  UsCityOption,
  UsStateOption
} from "@/lib/receivingContact";
import { cn } from "@/lib/utils";
import { receivingContactSchema } from "@/validations/receivingContact";

export type ReceivingContactFormValues = {
  full_name: string;
  relationship: string;
  country_code: string;
  phone_number: string;
  us_state_id: string;
  us_city_id: string;
  city_other: string;
  address_reference: string;
  notes: string;
};

type ReceivingContactFormProps = {
  cities: UsCityOption[];
  existingContact?: ReceivingContactForClient | null;
  onCancel: () => void;
  onSaved: (contact: ReceivingContactForClient) => void;
  states: UsStateOption[];
};

type ReceivingContactResponse = {
  contact?: ReceivingContactForClient;
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

function getDefaultValues(
  contact: ReceivingContactForClient | null | undefined
): ReceivingContactFormValues {
  return {
    full_name: contact?.full_name ?? "",
    relationship: contact?.relationship ?? "",
    country_code: contact?.country_code ?? "+1",
    phone_number: contact?.phone_number ?? "",
    us_state_id: contact?.us_state_id ?? "",
    us_city_id: contact?.us_city_id ?? (contact?.city_other ? US_CITY_OTHER_VALUE : ""),
    city_other: contact?.city_other ?? "",
    address_reference: contact?.address_reference ?? "",
    notes: contact?.notes ?? ""
  };
}

export function ReceivingContactForm({
  cities,
  existingContact,
  onCancel,
  onSaved,
  states
}: ReceivingContactFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValues = useMemo(() => getDefaultValues(existingContact), [existingContact]);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue
  } = useForm<ReceivingContactFormValues>({
    resolver: zodResolver(receivingContactSchema),
    defaultValues
  });
  const countryCode = useWatch({ control, name: "country_code" });
  const phoneNumber = useWatch({ control, name: "phone_number" });
  const selectedStateId = useWatch({ control, name: "us_state_id" });
  const selectedCityId = useWatch({ control, name: "us_city_id" });
  const filteredCities = useMemo(
    () => cities.filter((city) => city.state_id === selectedStateId),
    [cities, selectedStateId]
  );
  const showCityOther = selectedCityId === US_CITY_OTHER_VALUE;
  const whatsappPreview = phoneNumber
    ? buildWhatsappE164(countryCode || "+1", phoneNumber)
    : "Pendiente";

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!selectedStateId) {
      setValue("us_city_id", "");
      setValue("city_other", "");
      return;
    }

    if (
      selectedCityId &&
      selectedCityId !== US_CITY_OTHER_VALUE &&
      !filteredCities.some((city) => city.id === selectedCityId)
    ) {
      setValue("us_city_id", "");
      setValue("city_other", "");
    }
  }, [filteredCities, selectedCityId, selectedStateId, setValue]);

  useEffect(() => {
    if (selectedCityId !== US_CITY_OTHER_VALUE) {
      setValue("city_other", "");
    }
  }, [selectedCityId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/receiving-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const result = (await response.json()) as ReceivingContactResponse;

      if (!response.ok || !result.ok || !result.contact) {
        setFormError(result.message ?? "No pudimos guardar el contacto.");
        return;
      }

      onSaved(result.contact);
    } catch {
      setFormError("No pudimos guardar el contacto. Intenta nuevamente.");
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
            Contacto que recibe
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Informacion del destino
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
            placeholder="Nombre de la persona que recibe"
            type="text"
            {...register("full_name")}
          />
          <FieldError message={errors.full_name?.message} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="relationship">
            Relacion con el cliente
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
            {RECEIVING_CONTACT_RELATIONSHIP_OPTIONS.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
          <FieldError message={errors.relationship?.message} />
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">WhatsApp del contacto</h3>
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
              placeholder="2135557890"
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

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">Ubicacion en Estados Unidos</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="us_state_id">
              Estado
            </label>
            <select
              className={cn(
                inputClassName,
                errors.us_state_id && "border-danger focus:border-danger focus:ring-danger/20"
              )}
              id="us_state_id"
              {...register("us_state_id")}
            >
              <option value="">Selecciona un estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.us_state_id?.message} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="us_city_id">
              Ciudad
            </label>
            <select
              className={cn(
                inputClassName,
                errors.us_city_id && "border-danger focus:border-danger focus:ring-danger/20"
              )}
              disabled={!selectedStateId}
              id="us_city_id"
              {...register("us_city_id")}
            >
              <option value="">Selecciona una ciudad</option>
              {filteredCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
              {selectedStateId ? <option value={US_CITY_OTHER_VALUE}>Otra</option> : null}
            </select>
            <FieldError message={errors.us_city_id?.message} />
          </div>

          {showCityOther ? (
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="city_other">
                Escribe la ciudad
              </label>
              <input
                className={cn(
                  inputClassName,
                  errors.city_other && "border-danger focus:border-danger focus:ring-danger/20"
                )}
                id="city_other"
                placeholder="Ciudad"
                type="text"
                {...register("city_other")}
              />
              <FieldError message={errors.city_other?.message} />
            </div>
          ) : null}

          <div className={showCityOther ? "" : "lg:col-span-2"}>
            <label className="text-sm font-medium text-foreground" htmlFor="address_reference">
              Direccion aproximada o zona de referencia
            </label>
            <input
              className={cn(
                inputClassName,
                errors.address_reference &&
                  "border-danger focus:border-danger focus:ring-danger/20"
              )}
              id="address_reference"
              placeholder="Zona, calle principal o referencia"
              type="text"
              {...register("address_reference")}
            />
            <FieldError message={errors.address_reference?.message} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium text-foreground" htmlFor="notes">
          Comentarios adicionales
        </label>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Puedes agregar referencias como colonia, zona, calle principal o informacion que ayude a
          ubicar el destino.
        </p>
        <textarea
          className={cn(
            textareaClassName,
            errors.notes && "border-danger focus:border-danger focus:ring-danger/20"
          )}
          id="notes"
          maxLength={2000}
          placeholder="Comentarios adicionales del destino aproximado."
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
          {isSubmitting ? "Guardando..." : "Guardar contacto"}
        </button>
      </div>
    </form>
  );
}
