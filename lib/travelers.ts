import { getActiveApplicationForClient } from "@/lib/applications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TravelerData } from "@/validations/traveler";
import type { TravelerRow } from "@/types/database";

export type TravelerForClient = Pick<
  TravelerRow,
  | "id"
  | "application_id"
  | "full_name"
  | "birth_date"
  | "age"
  | "country_origin"
  | "nationality"
  | "relationship"
  | "country_code"
  | "phone_number"
  | "whatsapp_e164"
  | "email"
  | "is_main_client"
  | "requires_mexico_entry_review"
  | "mexico_entry_status"
  | "notes"
  | "created_at"
  | "updated_at"
>;

export type TravelerMutationResult =
  | {
      status: "created" | "updated" | "deleted";
      traveler?: TravelerForClient;
    }
  | {
      status: "no_active_application" | "not_found" | "limit_reached";
      message: string;
    };

const TRAVELER_SELECT =
  "id, application_id, full_name, birth_date, age, country_origin, nationality, relationship, country_code, phone_number, whatsapp_e164, email, is_main_client, requires_mexico_entry_review, mexico_entry_status, notes, created_at, updated_at";

export async function getTravelersForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("travelers")
    .select(TRAVELER_SELECT)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Could not read travelers.");
  }

  return data ?? [];
}

export async function getTravelerSetupForClient(clientId: string) {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      activeApplication: null,
      travelers: []
    };
  }

  const travelers = await getTravelersForApplication(activeApplication.id);

  return {
    activeApplication,
    travelers
  };
}

async function clearMainTraveler(applicationId: string, exceptTravelerId?: string) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("travelers")
    .update({ is_main_client: false })
    .eq("application_id", applicationId);

  if (exceptTravelerId) {
    query = query.neq("id", exceptTravelerId);
  }

  const { error } = await query;

  if (error) {
    throw new Error("Could not update main traveler.");
  }
}

async function assignFirstTravelerAsMain(applicationId: string) {
  const travelers = await getTravelersForApplication(applicationId);
  const firstTraveler = travelers[0];

  if (!firstTraveler) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("travelers")
    .update({ is_main_client: true })
    .eq("id", firstTraveler.id);

  if (error) {
    throw new Error("Could not assign main traveler.");
  }
}

function buildTravelerPayload(input: TravelerData, isMainClient: boolean) {
  return {
    full_name: input.full_name,
    birth_date: input.birth_date,
    age: input.age,
    country_origin: input.country_origin,
    nationality: input.nationality,
    relationship: input.relationship,
    country_code: input.country_code,
    phone_number: input.phone_number,
    whatsapp_e164: input.whatsapp_e164,
    email: input.email,
    is_main_client: isMainClient,
    requires_mexico_entry_review: input.requires_mexico_entry_review,
    mexico_entry_status: input.requires_mexico_entry_review ? "required" : "not_reviewed",
    notes: input.notes
  } satisfies Partial<TravelerRow>;
}

export async function createTravelerForClient(
  clientId: string,
  input: TravelerData
): Promise<TravelerMutationResult> {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      status: "no_active_application",
      message: "Primero debes iniciar tu registro para agregar personas a tu proceso."
    };
  }

  const travelers = await getTravelersForApplication(activeApplication.id);

  if (travelers.length >= activeApplication.total_people) {
    return {
      status: "limit_reached",
      message: "Ya agregaste todas las personas incluidas en tu proceso."
    };
  }

  const shouldBeMainClient = travelers.length === 0 || input.is_main_client;

  if (shouldBeMainClient) {
    await clearMainTraveler(activeApplication.id);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("travelers")
    .insert({
      application_id: activeApplication.id,
      ...buildTravelerPayload(input, shouldBeMainClient)
    })
    .select(TRAVELER_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Could not create traveler.");
  }

  return {
    status: "created",
    traveler: data
  };
}

export async function updateTravelerForClient(
  clientId: string,
  travelerId: string,
  input: TravelerData
): Promise<TravelerMutationResult> {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      status: "no_active_application",
      message: "Primero debes iniciar tu registro para agregar personas a tu proceso."
    };
  }

  const travelers = await getTravelersForApplication(activeApplication.id);
  const currentTraveler = travelers.find((traveler) => traveler.id === travelerId);

  if (!currentTraveler) {
    return {
      status: "not_found",
      message: "No encontramos esta persona dentro de tu proceso."
    };
  }

  const otherMainTraveler = travelers.find(
    (traveler) => traveler.id !== travelerId && traveler.is_main_client
  );
  const shouldBeMainClient =
    input.is_main_client || (currentTraveler.is_main_client && !otherMainTraveler);

  if (shouldBeMainClient) {
    await clearMainTraveler(activeApplication.id, travelerId);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("travelers")
    .update(buildTravelerPayload(input, shouldBeMainClient))
    .eq("id", travelerId)
    .eq("application_id", activeApplication.id)
    .select(TRAVELER_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Could not update traveler.");
  }

  return {
    status: "updated",
    traveler: data
  };
}

export async function deleteTravelerForClient(
  clientId: string,
  travelerId: string
): Promise<TravelerMutationResult> {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      status: "no_active_application",
      message: "Primero debes iniciar tu registro para agregar personas a tu proceso."
    };
  }

  const travelers = await getTravelersForApplication(activeApplication.id);
  const currentTraveler = travelers.find((traveler) => traveler.id === travelerId);

  if (!currentTraveler) {
    return {
      status: "not_found",
      message: "No encontramos esta persona dentro de tu proceso."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("travelers")
    .delete()
    .eq("id", travelerId)
    .eq("application_id", activeApplication.id);

  if (error) {
    throw new Error("Could not delete traveler.");
  }

  if (currentTraveler.is_main_client) {
    await assignFirstTravelerAsMain(activeApplication.id);
  }

  return {
    status: "deleted"
  };
}
