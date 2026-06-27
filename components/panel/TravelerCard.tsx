"use client";

import { Edit3, Trash2, UserRound } from "lucide-react";
import type { TravelerForClient } from "@/lib/travelers";

type TravelerCardProps = {
  onDelete: (traveler: TravelerForClient) => void;
  onEdit: (traveler: TravelerForClient) => void;
  traveler: TravelerForClient;
};

export function TravelerCard({ onDelete, onEdit, traveler }: TravelerCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{traveler.full_name}</h3>
              {traveler.is_main_client ? (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  Cliente principal
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {traveler.age ?? "Sin edad"} anos · {traveler.nationality ?? "Sin nacionalidad"} ·{" "}
              {traveler.relationship ?? "Sin relacion"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary hover:text-primary"
            onClick={() => onEdit(traveler)}
            type="button"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            Editar
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger shadow-soft transition hover:border-danger"
            onClick={() => onDelete(traveler)}
            type="button"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">WhatsApp</p>
          <p className="mt-1 break-all text-sm font-semibold text-foreground">
            {traveler.whatsapp_e164 ?? "Sin WhatsApp propio"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Pais de origen</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {traveler.country_origin ?? "Sin dato"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Revision Mexico</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {traveler.requires_mexico_entry_review ? traveler.mexico_entry_status : "No requerida"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">Correo</p>
          <p className="mt-1 break-all text-sm font-semibold text-foreground">
            {traveler.email ?? "Sin correo"}
          </p>
        </div>
      </div>
    </article>
  );
}
