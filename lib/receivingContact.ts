import { getActiveApplicationForClient } from "@/lib/applications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReceivingContactData } from "@/validations/receivingContact";
import type { ReceivingContactRow, UsCityRow, UsStateRow } from "@/types/database";

export type ReceivingContactForClient = Pick<
  ReceivingContactRow,
  | "id"
  | "application_id"
  | "full_name"
  | "relationship"
  | "country_code"
  | "phone_number"
  | "whatsapp_e164"
  | "us_state_id"
  | "us_city_id"
  | "city_other"
  | "address_reference"
  | "notes"
  | "created_at"
  | "updated_at"
>;

export type UsStateOption = Pick<UsStateRow, "code" | "id" | "name">;
export type UsCityOption = Pick<UsCityRow, "id" | "is_major" | "name" | "state_id">;

export type ReceivingContactMutationResult =
  | {
      contact: ReceivingContactForClient;
      status: "created" | "updated";
    }
  | {
      message: string;
      status: "no_active_application" | "travelers_incomplete";
    };

const RECEIVING_CONTACT_SELECT =
  "id, application_id, full_name, relationship, country_code, phone_number, whatsapp_e164, us_state_id, us_city_id, city_other, address_reference, notes, created_at, updated_at";

export async function getReceivingContactForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("receiving_contacts")
    .select(RECEIVING_CONTACT_SELECT)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read receiving contact.");
  }

  return data;
}

export async function getUsLocationOptions() {
  const supabase = createSupabaseAdminClient();
  const [statesResult, citiesResult] = await Promise.all([
    supabase
      .from("us_states")
      .select("id, name, code")
      .eq("active", true)
      .order("name", { ascending: true }),
    supabase
      .from("us_cities")
      .select("id, state_id, name, is_major")
      .eq("active", true)
      .order("is_major", { ascending: false })
      .order("name", { ascending: true })
  ]);

  if (statesResult.error || citiesResult.error) {
    throw new Error("Could not read location options.");
  }

  return {
    states: statesResult.data ?? [],
    cities: citiesResult.data ?? []
  };
}

export async function getReceivingContactSetupForClient(clientId: string) {
  const activeApplication = await getActiveApplicationForClient(clientId);
  const locations = await getUsLocationOptions();

  if (!activeApplication) {
    return {
      activeApplication: null,
      cities: locations.cities,
      contact: null,
      states: locations.states
    };
  }

  const contact = await getReceivingContactForApplication(activeApplication.id);

  return {
    activeApplication,
    cities: locations.cities,
    contact,
    states: locations.states
  };
}

function buildReceivingContactPayload(input: ReceivingContactData) {
  return {
    full_name: input.full_name,
    relationship: input.relationship,
    country_code: input.country_code,
    phone_number: input.phone_number,
    whatsapp_e164: input.whatsapp_e164,
    us_state_id: input.us_state_id,
    us_city_id: input.us_city_id,
    city_other: input.city_other,
    address_reference: input.address_reference,
    notes: input.notes
  } satisfies Partial<ReceivingContactRow>;
}

export async function saveReceivingContactForClient(
  clientId: string,
  input: ReceivingContactData
): Promise<ReceivingContactMutationResult> {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      status: "no_active_application",
      message: "Primero debes iniciar tu registro para agregar el contacto que recibe."
    };
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return {
      status: "travelers_incomplete",
      message: "Antes de continuar, agrega a todas las personas incluidas en tu proceso."
    };
  }

  const supabase = createSupabaseAdminClient();
  const existingContact = await getReceivingContactForApplication(activeApplication.id);

  if (existingContact) {
    const { data, error } = await supabase
      .from("receiving_contacts")
      .update(buildReceivingContactPayload(input))
      .eq("id", existingContact.id)
      .eq("application_id", activeApplication.id)
      .select(RECEIVING_CONTACT_SELECT)
      .single();

    if (error || !data) {
      throw new Error("Could not update receiving contact.");
    }

    return {
      status: "updated",
      contact: data
    };
  }

  const { data, error } = await supabase
    .from("receiving_contacts")
    .insert({
      application_id: activeApplication.id,
      ...buildReceivingContactPayload(input)
    })
    .select(RECEIVING_CONTACT_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Could not create receiving contact.");
  }

  return {
    status: "created",
    contact: data
  };
}
