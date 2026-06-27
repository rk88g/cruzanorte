import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  APPLICATION_START_PROGRESS,
  APPLICATION_START_STAGE
} from "@/lib/constants";
import type { ApplicationStart } from "@/validations/application";
import type { ApplicationRow, ApplicationStatus } from "@/types/database";

export const ACTIVE_APPLICATION_STATUSES = [
  "draft",
  "active",
  "in_review",
  "paused"
] as const satisfies readonly ApplicationStatus[];

export type ClientActiveApplication = Pick<
  ApplicationRow,
  | "id"
  | "client_id"
  | "main_contact_name"
  | "current_stage"
  | "progress"
  | "status"
  | "total_people"
  | "origin_country"
  | "origin_city"
  | "notes_public"
  | "requested_date_id"
  | "approved_date_id"
  | "requested_date_status"
  | "requested_date_notes"
  | "updated_at"
> & {
  receiving_contact_exists: boolean;
  travelers_count: number;
};

type ActiveApplicationRow = Omit<
  ClientActiveApplication,
  "receiving_contact_exists" | "travelers_count"
>;

async function getTravelerCountForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("travelers")
    .select("id", { count: "exact", head: true })
    .eq("application_id", applicationId);

  if (error) {
    throw new Error("Could not count travelers.");
  }

  return count ?? 0;
}

async function hasReceivingContactForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("receiving_contacts")
    .select("id", { count: "exact", head: true })
    .eq("application_id", applicationId);

  if (error) {
    throw new Error("Could not count receiving contacts.");
  }

  return (count ?? 0) > 0;
}

async function withTravelerCount(application: ActiveApplicationRow) {
  const [travelersCount, receivingContactExists] = await Promise.all([
    getTravelerCountForApplication(application.id),
    hasReceivingContactForApplication(application.id)
  ]);

  return {
    ...application,
    receiving_contact_exists: receivingContactExists,
    travelers_count: travelersCount
  };
}

export type StartApplicationResult =
  | {
      status: "created";
      application: ClientActiveApplication;
    }
  | {
      status: "duplicate";
      application: ClientActiveApplication;
    };

export async function getActiveApplicationForClient(clientId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, client_id, main_contact_name, current_stage, progress, status, total_people, origin_country, origin_city, requested_date_id, approved_date_id, requested_date_status, requested_date_notes, notes_public, updated_at"
    )
    .eq("client_id", clientId)
    .in("status", [...ACTIVE_APPLICATION_STATUSES])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read active application.");
  }

  if (!data) {
    return null;
  }

  return withTravelerCount(data);
}

function buildInitialNotes(input: ApplicationStart) {
  const lines = [
    "Informacion inicial del proceso",
    `Motivo principal: ${input.process_reason}`,
    `Pais de salida: ${input.departure_country}`,
    `Ciudad de salida: ${input.departure_city}`
  ];

  if (input.desired_date) {
    lines.push(`Fecha deseada: ${input.desired_date}`);
  }

  if (input.alternative_date) {
    lines.push(`Fecha alternativa: ${input.alternative_date}`);
  }

  if (input.notes_public) {
    lines.push("", "Comentarios iniciales:", input.notes_public);
  }

  return lines.join("\n");
}

export async function startApplicationForClient(
  clientId: string,
  input: ApplicationStart
): Promise<StartApplicationResult> {
  const supabase = createSupabaseAdminClient();
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (activeApplication) {
    return {
      status: "duplicate",
      application: activeApplication
    };
  }

  const userUpdate = await supabase
    .from("users")
    .update({
      full_name: input.main_contact_name,
      email: input.email ?? null
    })
    .eq("id", clientId);

  if (userUpdate.error) {
    throw new Error("Could not update client profile.");
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      client_id: clientId,
      main_contact_name: input.main_contact_name,
      current_stage: APPLICATION_START_STAGE,
      progress: APPLICATION_START_PROGRESS,
      status: "active",
      requested_date_status: "none",
      total_people: input.total_people,
      origin_country: input.origin_country,
      origin_city: input.origin_city,
      notes_public: buildInitialNotes(input)
    })
    .select(
      "id, client_id, main_contact_name, current_stage, progress, status, total_people, origin_country, origin_city, requested_date_id, approved_date_id, requested_date_status, requested_date_notes, notes_public, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error("Could not create application.");
  }

  return {
    status: "created",
    application: {
      ...data,
      receiving_contact_exists: false,
      travelers_count: 0
    }
  };
}
