"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReceivingContactForm } from "@/components/forms/ReceivingContactForm";
import { ReceivingContactCard } from "@/components/panel/ReceivingContactCard";
import type {
  ReceivingContactForClient,
  UsCityOption,
  UsStateOption
} from "@/lib/receivingContact";

type ReceivingContactManagerProps = {
  cities: UsCityOption[];
  initialContact: ReceivingContactForClient | null;
  states: UsStateOption[];
};

export function ReceivingContactManager({
  cities,
  initialContact,
  states
}: ReceivingContactManagerProps) {
  const router = useRouter();
  const [contact, setContact] = useState(initialContact);
  const [isEditing, setIsEditing] = useState(!initialContact);

  function handleSaved(savedContact: ReceivingContactForClient) {
    setContact(savedContact);
    setIsEditing(false);
    router.refresh();
  }

  if (isEditing) {
    return (
      <ReceivingContactForm
        cities={cities}
        existingContact={contact}
        onCancel={() => setIsEditing(false)}
        onSaved={handleSaved}
        states={states}
      />
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <ReceivingContactCard
      cities={cities}
      contact={contact}
      onEdit={() => setIsEditing(true)}
      states={states}
    />
  );
}
