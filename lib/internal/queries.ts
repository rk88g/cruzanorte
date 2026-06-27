import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ApplicationRow,
  ApplicationStatus,
  TravelerRow,
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
  | "notes_public"
  | "created_at"
  | "updated_at"
>;

export type InternalApplicationListItem = InternalApplication & {
  client: InternalClient | null;
};

export type InternalClientListItem = InternalClient & {
  applications_count: number;
};

export type InternalApplicationDetail = InternalApplicationListItem & {
  travelers: Pick<
    TravelerRow,
    | "id"
    | "full_name"
    | "age"
    | "nationality"
    | "relationship"
    | "country_code"
    | "phone_number"
    | "whatsapp_e164"
    | "is_main_client"
    | "mexico_entry_status"
  >[];
  process_reason: string | null;
};

const APPLICATION_SELECT =
  "id, client_id, main_contact_name, current_stage, progress, status, total_people, origin_country, origin_city, arrival_country, arrival_city, notes_public, created_at, updated_at";

const CLIENT_SELECT =
  "id, full_name, email, country_code, phone_number, whatsapp_e164, status, created_at";

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
  const clientsById = await getClientsById(
    getUniqueValues(applications.map((application) => application.client_id))
  );

  return applications.map((application) => ({
    ...application,
    client: clientsById.get(application.client_id) ?? null
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

  const [clientsById, travelersResult] = await Promise.all([
    getClientsById([application.client_id]),
    supabase
      .from("travelers")
      .select(
        "id, full_name, age, nationality, relationship, country_code, phone_number, whatsapp_e164, is_main_client, mexico_entry_status"
      )
      .eq("application_id", application.id)
      .order("created_at", { ascending: true })
  ]);

  if (travelersResult.error) {
    throw new Error("Could not read travelers.");
  }

  return {
    ...application,
    client: clientsById.get(application.client_id) ?? null,
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
