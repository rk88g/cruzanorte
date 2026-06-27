import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  APPLICATION_START_PROGRESS,
  APPLICATION_START_STAGE,
  MEXICO_REVIEW_DOCUMENT_TYPES,
  REQUIRED_GENERAL_DOCUMENT_TYPES,
  REQUIRED_TRAVELER_DOCUMENT_TYPES
} from "@/lib/constants";
import type { ApplicationStart } from "@/validations/application";
import type { ApplicationRow, ApplicationStatus, DocumentStatus } from "@/types/database";

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
  document_accepted_count: number;
  document_count: number;
  document_pending_review_count: number;
  document_rejected_count: number;
  document_replacement_requested_count: number;
  required_document_count: number;
  receiving_contact_exists: boolean;
  travelers_count: number;
};

type ActiveApplicationRow = Omit<
  ClientActiveApplication,
  | "document_accepted_count"
  | "document_count"
  | "document_pending_review_count"
  | "document_rejected_count"
  | "document_replacement_requested_count"
  | "receiving_contact_exists"
  | "required_document_count"
  | "travelers_count"
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

async function getDocumentSummaryForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const [travelersResult, documentsResult] = await Promise.all([
    supabase
      .from("travelers")
      .select("id, requires_mexico_entry_review")
      .eq("application_id", applicationId),
    supabase
      .from("documents")
      .select("id, status, file_path")
      .eq("application_id", applicationId)
  ]);

  if (travelersResult.error || documentsResult.error) {
    throw new Error("Could not read document summary.");
  }

  const travelers = travelersResult.data ?? [];
  const documents = documentsResult.data ?? [];
  const mexicoReviewTravelerCount = travelers.filter(
    (traveler) => traveler.requires_mexico_entry_review
  ).length;
  const requiredDocumentCount =
    REQUIRED_GENERAL_DOCUMENT_TYPES.length +
    travelers.length * REQUIRED_TRAVELER_DOCUMENT_TYPES.length +
    mexicoReviewTravelerCount * MEXICO_REVIEW_DOCUMENT_TYPES.length;
  const countStatus = (statuses: DocumentStatus[]) =>
    documents.filter((document) => statuses.includes(document.status)).length;

  return {
    document_accepted_count: countStatus(["accepted"]),
    document_count: documents.filter((document) => Boolean(document.file_path)).length,
    document_pending_review_count: countStatus(["uploaded", "in_review"]),
    document_rejected_count: countStatus(["rejected"]),
    document_replacement_requested_count: countStatus(["replacement_requested"]),
    required_document_count: requiredDocumentCount
  };
}

async function withTravelerCount(application: ActiveApplicationRow) {
  const [travelersCount, receivingContactExists, documentSummary] = await Promise.all([
    getTravelerCountForApplication(application.id),
    hasReceivingContactForApplication(application.id),
    getDocumentSummaryForApplication(application.id)
  ]);

  return {
    ...application,
    ...documentSummary,
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
      document_accepted_count: 0,
      document_count: 0,
      document_pending_review_count: 0,
      document_rejected_count: 0,
      document_replacement_requested_count: 0,
      receiving_contact_exists: false,
      required_document_count: 0,
      travelers_count: 0
    }
  };
}
