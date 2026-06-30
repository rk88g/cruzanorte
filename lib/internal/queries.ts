import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getApplicationDocumentSummary,
  type ClientDocumentationSummary
} from "@/lib/documents";
import type {
  ApplicationRow,
  ApplicationStatus,
  AvailableDateRow,
  DocumentRow,
  TravelerMexicoEntryRequirementRow,
  ReceivingContactRow,
  TravelerRow,
  UsCityRow,
  UsStateRow,
  UserRow
} from "@/types/database";

type InternalClient = Pick<
  UserRow,
  | "id"
  | "full_name"
  | "email"
  | "country_code"
  | "phone_number"
  | "whatsapp_e164"
  | "status"
  | "created_at"
>;

type InternalApplication = Pick<
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
  | "arrival_country"
  | "arrival_city"
  | "requested_date_id"
  | "approved_date_id"
  | "requested_date_status"
  | "requested_date_notes"
  | "notes_internal"
  | "notes_public"
  | "created_at"
  | "updated_at"
>;

type InternalAvailableDateSummary = Pick<
  AvailableDateRow,
  "capacity_available" | "capacity_total" | "date" | "id" | "location_city" | "status"
>;

export type InternalApplicationListItem = InternalApplication & {
  approved_date: InternalAvailableDateSummary | null;
  client: InternalClient | null;
  requested_date: InternalAvailableDateSummary | null;
};

export type InternalClientListItem = InternalClient & {
  applications_count: number;
};

export type InternalApplicationDetail = InternalApplicationListItem & {
  document_summary: ClientDocumentationSummary;
  documents: Pick<
    DocumentRow,
    | "admin_notes"
    | "client_notes"
    | "created_at"
    | "document_type"
    | "file_mime_type"
    | "file_name"
    | "file_size"
    | "id"
    | "mexico_requirement_id"
    | "reviewed_at"
    | "status"
    | "traveler_id"
  >[];
  mexico_requirements: Pick<
    TravelerMexicoEntryRequirementRow,
    | "id"
    | "traveler_id"
    | "requirement_type"
    | "requirement_name"
    | "status"
    | "notes_public"
    | "notes_internal"
    | "reviewed_at"
  >[];
  receiving_contact: (Pick<
    ReceivingContactRow,
    | "address_reference"
    | "city_other"
    | "country_code"
    | "full_name"
    | "id"
    | "notes"
    | "phone_number"
    | "relationship"
    | "us_city_id"
    | "us_state_id"
    | "whatsapp_e164"
  > & {
    city_name: string | null;
    state_name: string | null;
  }) | null;
  travelers: Pick<
    TravelerRow,
    | "id"
    | "full_name"
    | "birth_date"
    | "age"
    | "country_origin"
    | "nationality"
    | "relationship"
    | "country_code"
    | "phone_number"
    | "whatsapp_e164"
    | "notes"
    | "is_main_client"
    | "requires_mexico_entry_review"
    | "mexico_entry_status"
  >[];
  process_reason: string | null;
};

const APPLICATION_SELECT =
  "id, client_id, main_contact_name, current_stage, progress, status, total_people, origin_country, origin_city, arrival_country, arrival_city, requested_date_id, approved_date_id, requested_date_status, requested_date_notes, notes_internal, notes_public, created_at, updated_at";

const CLIENT_SELECT =
  "id, full_name, email, country_code, phone_number, whatsapp_e164, status, created_at";

const AVAILABLE_DATE_SUMMARY_SELECT =
  "id, date, location_city, capacity_total, capacity_available, status";

const APPLICATION_STATUSES: ApplicationStatus[] = [
  "draft",
  "active",
  "in_review",
  "paused",
  "completed",
  "cancelled"
];

async function getClientsCount() {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "client");

  if (error) {
    throw new Error("Could not count clients.");
  }

  return count ?? 0;
}

async function getApplicationsCount(status?: ApplicationStatus) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("applications").select("id", { count: "exact", head: true });

  if (status) {
    query = query.eq("status", status);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error("Could not count applications.");
  }

  return count ?? 0;
}

async function getClientsById(clientIds: string[]) {
  if (clientIds.length === 0) {
    return new Map<string, InternalClient>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(CLIENT_SELECT)
    .in("id", clientIds);

  if (error) {
    throw new Error("Could not read clients.");
  }

  return new Map((data ?? []).map((client) => [client.id, client]));
}

async function getDatesById(dateIds: string[]) {
  const uniqueDateIds = getUniqueValues(dateIds.filter(Boolean));

  if (uniqueDateIds.length === 0) {
    return new Map<string, InternalAvailableDateSummary>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("available_dates")
    .select(AVAILABLE_DATE_SUMMARY_SELECT)
    .in("id", uniqueDateIds);

  if (error) {
    throw new Error("Could not read date summaries.");
  }

  return new Map((data ?? []).map((date) => [date.id, date]));
}

function getUniqueValues(values: string[]) {
  return [...new Set(values)];
}

function extractProcessReason(notes: string | null) {
  if (!notes) {
    return null;
  }

  const line = notes
    .split("\n")
    .find((item) => item.toLowerCase().startsWith("motivo principal:"));

  return line?.replace(/^Motivo principal:\s*/i, "").trim() || null;
}

export async function getInternalApplications(limit?: number) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Could not read applications.");
  }

  const applications = data ?? [];
  const [clientsById, datesById] = await Promise.all([
    getClientsById(getUniqueValues(applications.map((application) => application.client_id))),
    getDatesById(
      applications.flatMap((application) => [
        application.requested_date_id ?? "",
        application.approved_date_id ?? ""
      ])
    )
  ]);

  return applications.map((application) => ({
    ...application,
    approved_date: application.approved_date_id
      ? datesById.get(application.approved_date_id) ?? null
      : null,
    client: clientsById.get(application.client_id) ?? null,
    requested_date: application.requested_date_id
      ? datesById.get(application.requested_date_id) ?? null
      : null
  }));
}

export async function getInternalDashboardData() {
  const [
    totalClients,
    totalApplications,
    activeApplications,
    pausedApplications,
    completedApplications,
    latestApplications
  ] = await Promise.all([
    getClientsCount(),
    getApplicationsCount(),
    getApplicationsCount("active"),
    getApplicationsCount("paused"),
    getApplicationsCount("completed"),
    getInternalApplications(5)
  ]);

  return {
    totalClients,
    totalApplications,
    activeApplications,
    pausedApplications,
    completedApplications,
    latestApplications
  };
}

export async function getInternalApplicationDetail(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: application, error } = await supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read application detail.");
  }

  if (!application) {
    return null;
  }

  const [clientsById, datesById, documentSummary, travelersResult] = await Promise.all([
    getClientsById([application.client_id]),
    getDatesById([application.requested_date_id ?? "", application.approved_date_id ?? ""]),
    getApplicationDocumentSummary(application.id, application.current_stage),
    supabase
      .from("travelers")
      .select(
        "id, full_name, birth_date, age, country_origin, nationality, relationship, country_code, phone_number, whatsapp_e164, notes, is_main_client, requires_mexico_entry_review, mexico_entry_status"
      )
      .eq("application_id", application.id)
      .order("created_at", { ascending: true })
  ]);

  if (travelersResult.error) {
    throw new Error("Could not read travelers.");
  }

  const { data: mexicoRequirements, error: mexicoRequirementsError } = await supabase
    .from("traveler_mexico_entry_requirements")
    .select(
      "id, traveler_id, requirement_type, requirement_name, status, notes_public, notes_internal, reviewed_at"
    )
    .eq("application_id", application.id)
    .order("created_at", { ascending: true });

  if (mexicoRequirementsError) {
    throw new Error("Could not read Mexico requirements.");
  }

  const { data: receivingContact, error: receivingContactError } = await supabase
    .from("receiving_contacts")
    .select(
      "id, full_name, relationship, country_code, phone_number, whatsapp_e164, us_state_id, us_city_id, city_other, address_reference, notes"
    )
    .eq("application_id", application.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (receivingContactError) {
    throw new Error("Could not read receiving contact.");
  }

  let state: Pick<UsStateRow, "name"> | null = null;
  let city: Pick<UsCityRow, "name"> | null = null;

  if (receivingContact?.us_state_id) {
    const stateResult = await supabase
      .from("us_states")
      .select("name")
      .eq("id", receivingContact.us_state_id)
      .maybeSingle();

    if (stateResult.error) {
      throw new Error("Could not read receiving contact state.");
    }

    state = stateResult.data;
  }

  if (receivingContact?.us_city_id) {
    const cityResult = await supabase
      .from("us_cities")
      .select("name")
      .eq("id", receivingContact.us_city_id)
      .maybeSingle();

    if (cityResult.error) {
      throw new Error("Could not read receiving contact city.");
    }

    city = cityResult.data;
  }

  return {
    ...application,
    approved_date: application.approved_date_id
      ? datesById.get(application.approved_date_id) ?? null
      : null,
    client: clientsById.get(application.client_id) ?? null,
    document_summary: documentSummary.summary,
    documents: documentSummary.documents.map((document) => ({
      admin_notes: document.admin_notes,
      client_notes: document.client_notes,
      created_at: document.created_at,
      document_type: document.document_type,
      file_mime_type: document.file_mime_type,
      file_name: document.file_name,
      file_size: document.file_size,
      id: document.id,
      mexico_requirement_id: document.mexico_requirement_id,
      reviewed_at: document.reviewed_at,
      status: document.status,
      traveler_id: document.traveler_id
    })),
    mexico_requirements: mexicoRequirements ?? [],
    requested_date: application.requested_date_id
      ? datesById.get(application.requested_date_id) ?? null
      : null,
    receiving_contact: receivingContact
      ? {
          ...receivingContact,
          city_name: city?.name ?? null,
          state_name: state?.name ?? null
        }
      : null,
    travelers: travelersResult.data ?? [],
    process_reason: extractProcessReason(application.notes_public)
  };
}

export async function getInternalClients() {
  const supabase = createSupabaseAdminClient();
  const { data: clients, error } = await supabase
    .from("users")
    .select(CLIENT_SELECT)
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not read clients.");
  }

  const clientRows = clients ?? [];
  const clientIds = clientRows.map((client) => client.id);
  const applicationCounts = new Map<string, number>();

  if (clientIds.length > 0) {
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select("client_id")
      .in("client_id", clientIds);

    if (applicationsError) {
      throw new Error("Could not read application counts.");
    }

    for (const application of applications ?? []) {
      applicationCounts.set(
        application.client_id,
        (applicationCounts.get(application.client_id) ?? 0) + 1
      );
    }
  }

  return clientRows.map((client) => ({
    ...client,
    applications_count: applicationCounts.get(client.id) ?? 0
  }));
}

export { APPLICATION_STATUSES };
