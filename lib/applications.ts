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
  | "updated_at"
>;

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
      "id, client_id, main_contact_name, current_stage, progress, status, total_people, origin_country, origin_city, notes_public, updated_at"
    )
    .eq("client_id", clientId)
    .in("status", [...ACTIVE_APPLICATION_STATUSES])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read active application.");
  }

  return data;
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
      total_people: input.total_people,
      origin_country: input.origin_country,
      origin_city: input.origin_city,
      notes_public: buildInitialNotes(input)
    })
    .select(
      "id, client_id, main_contact_name, current_stage, progress, status, total_people, origin_country, origin_city, notes_public, updated_at"
    )
    .single();

  if (error || !data) {
    throw new Error("Could not create application.");
  }

  return {
    status: "created",
    application: data
  };
}
