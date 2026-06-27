"use client";

import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TravelerForm } from "@/components/forms/TravelerForm";
import { TravelerCard } from "@/components/panel/TravelerCard";
import { Alert } from "@/components/ui/Alert";
import type { ClientActiveApplication } from "@/lib/applications";
import type { TravelerForClient } from "@/lib/travelers";

type TravelersListProps = {
  activeApplication: ClientActiveApplication;
  initialTravelers: TravelerForClient[];
};

type TravelerDeleteResponse = {
  ok: boolean;
  message?: string;
};

export function TravelersList({ activeApplication, initialTravelers }: TravelersListProps) {
  const router = useRouter();
  const [travelers, setTravelers] = useState(initialTravelers);
  const [editingTraveler, setEditingTraveler] = useState<TravelerForClient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(initialTravelers.length === 0);
  const [actionError, setActionError] = useState<string | null>(null);
  const expectedPeople = activeApplication.total_people;
  const hasReachedLimit = travelers.length >= expectedPeople;
  const countLabel = `${travelers.length} / ${expectedPeople}`;

  const sortedTravelers = useMemo(
    () =>
      [...travelers].sort(
        (first, second) =>
          new Date(first.created_at).getTime() - new Date(second.created_at).getTime()
      ),
    [travelers]
  );

  function handleSaved(savedTraveler: TravelerForClient) {
    setActionError(null);
    setTravelers((currentTravelers) => {
      const exists = currentTravelers.some((traveler) => traveler.id === savedTraveler.id);
      const normalizedTravelers = savedTraveler.is_main_client
        ? currentTravelers.map((traveler) => ({
            ...traveler,
            is_main_client: traveler.id === savedTraveler.id
          }))
        : currentTravelers;

      if (exists) {
        return normalizedTravelers.map((traveler) =>
          traveler.id === savedTraveler.id ? savedTraveler : traveler
        );
      }

      return savedTraveler.is_main_client
        ? [...normalizedTravelers, savedTraveler]
        : [...currentTravelers, savedTraveler];
    });
    setEditingTraveler(null);
    setIsFormOpen(false);
    router.refresh();
  }

  function handleEdit(traveler: TravelerForClient) {
    setActionError(null);
    setEditingTraveler(traveler);
    setIsFormOpen(true);
  }

  function handleCancel() {
    setEditingTraveler(null);
    setIsFormOpen(false);
    setActionError(null);
  }

  async function handleDelete(traveler: TravelerForClient) {
    const confirmed = window.confirm("Seguro que deseas eliminar esta persona del proceso?");

    if (!confirmed) {
      return;
    }

    setActionError(null);

    try {
      const response = await fetch(`/api/travelers/${traveler.id}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as TravelerDeleteResponse;

      if (!response.ok || !result.ok) {
        setActionError(result.message ?? "No pudimos eliminar esta persona.");
        return;
      }

      setTravelers((currentTravelers) => {
        const remainingTravelers = currentTravelers.filter((item) => item.id !== traveler.id);

        if (!traveler.is_main_client || remainingTravelers.length === 0) {
          return remainingTravelers;
        }

        const [firstTraveler, ...rest] = remainingTravelers;

        return [
          {
            ...firstTraveler,
            is_main_client: true
          },
          ...rest
        ];
      });
      setEditingTraveler(null);
      setIsFormOpen(false);
      router.refresh();
    } catch {
      setActionError("No pudimos eliminar esta persona. Intenta nuevamente.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Personas agregadas
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{countLabel}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Has agregado {travelers.length} de {expectedPeople} personas incluidas en tu
              proceso.
            </p>
          </div>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
            disabled={hasReachedLimit}
            onClick={() => {
              setEditingTraveler(null);
              setIsFormOpen(true);
            }}
            type="button"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Agregar persona
          </button>
        </div>

        {hasReachedLimit ? (
          <div className="mt-5">
            <Alert variant="success">
              Ya agregaste todas las personas incluidas en tu proceso.
            </Alert>
          </div>
        ) : null}

        {actionError ? (
          <div className="mt-5">
            <Alert variant="danger">{actionError}</Alert>
          </div>
        ) : null}
      </section>

      {isFormOpen && (!hasReachedLimit || editingTraveler) ? (
        <TravelerForm
          existingTraveler={editingTraveler}
          isFirstTraveler={travelers.length === 0}
          onCancel={handleCancel}
          onSaved={handleSaved}
        />
      ) : null}

      {sortedTravelers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">
            Aun no has agregado personas a tu proceso.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedTravelers.map((traveler) => (
            <TravelerCard
              key={traveler.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              traveler={traveler}
            />
          ))}
        </div>
      )}
    </div>
  );
}
