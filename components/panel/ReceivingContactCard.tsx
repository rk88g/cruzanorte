"use client";

import { Edit3, MapPin, MessageCircle, UserRound } from "lucide-react";
import type {
  ReceivingContactForClient,
  UsCityOption,
  UsStateOption
} from "@/lib/receivingContact";

type ReceivingContactCardProps = {
  cities: UsCityOption[];
  contact: ReceivingContactForClient;
  onEdit: () => void;
  states: UsStateOption[];
};

function getStateName(states: UsStateOption[], stateId: string | null) {
  return states.find((state) => state.id === stateId)?.name ?? "Sin estado";
}

function getCityName(cities: UsCityOption[], contact: ReceivingContactForClient) {
  if (contact.city_other) {
    return contact.city_other;
  }

  return cities.find((city) => city.id === contact.us_city_id)?.name ?? "Sin ciudad";
}

export function ReceivingContactCard({
  cities,
  contact,
  onEdit,
  states
}: ReceivingContactCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Contacto que recibe
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{contact.full_name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {contact.relationship ?? "Relacion no especificada"}
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary sm:w-auto"
          onClick={onEdit}
          type="button"
        >
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Editar
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            WhatsApp
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-foreground">
            {contact.whatsapp_e164}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">country_code</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{contact.country_code}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">phone_number</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{contact.phone_number}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            Estado
          </p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {getStateName(states, contact.us_state_id)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">Ciudad</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {getCityName(cities, contact)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-4 sm:col-span-2 lg:col-span-3">
          <p className="text-xs text-muted-foreground">Direccion aproximada</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {contact.address_reference ?? "Sin referencia"}
          </p>
        </div>
      </div>

      {contact.notes ? (
        <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
          <p className="text-xs text-muted-foreground">Notas</p>
          <p className="mt-2 text-sm leading-6 text-foreground">{contact.notes}</p>
        </div>
      ) : null}
    </article>
  );
}
