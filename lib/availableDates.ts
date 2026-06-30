import { getActiveApplicationForClient } from "@/lib/applications";
import {
  APPLICATION_DATE_APPROVED_PROGRESS,
  APPLICATION_DATE_APPROVED_STAGE,
  APPLICATION_DATE_REQUEST_PROGRESS,
  APPLICATION_DATE_REQUEST_STAGE
} from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AvailableDateData, DateDecisionData } from "@/validations/availableDate";
import type {
  ApplicationRow,
  AvailableDateRow,
  RequestedDateStatus,
  UserRow
} from "@/types/database";

const AVAILABLE_DATE_SELECT =
  "id, date, location_city, capacity_total, capacity_available, status, notes_internal, created_by, created_at, updated_at";

const CLIENT_AVAILABLE_DATE_SELECT =
  "id, date, location_city, capacity_available, status";

const APPLICATION_DATE_SELECT =
  "id, client_id, main_contact_name, current_stage, progress, status, requested_date_id, approved_date_id, requested_date_status, requested_date_notes, total_people, created_at, updated_at";

const CLIENT_SELECT =
  "id, full_name, email, country_code, phone_number, whatsapp_e164, status, created_at";

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

export type ClientAvailableDate = Pick<
  AvailableDateRow,
  "capacity_available" | "date" | "id" | "location_city" | "status"
>;

export type InternalAvailableDate = Pick<
  AvailableDateRow,
  | "capacity_available"
  | "capacity_total"
  | "created_at"
  | "date"
  | "id"
  | "location_city"
  | "notes_internal"
  | "status"
  | "updated_at"
>;

type InternalApplicationDateBase = Pick<
  ApplicationRow,
  | "approved_date_id"
  | "client_id"
  | "created_at"
  | "current_stage"
  | "id"
  | "main_contact_name"
  | "progress"
  | "requested_date_id"
  | "requested_date_notes"
  | "requested_date_status"
  | "status"
  | "total_people"
  | "updated_at"
>;

export type InternalApplicationDateItem = InternalApplicationDateBase & {
  client: InternalClient | null;
};

export type InternalAvailableDateListItem = InternalAvailableDate & {
  approved_applications_count: number;
  requested_applications_count: number;
  related_applications_count: number;
};

export type InternalAvailableDateDetail = InternalAvailableDate & {
  approved_applications_count: number;
  approved_people_count: number;
  related_applications: InternalApplicationDateItem[];
  requested_applications_count: number;
  requested_people_count: number;
};

export type DateRequestResult =
  | {
      message: string;
      status: "requested";
    }
  | {
      message: string;
      status:
        | "already_approved"
        | "already_requested"
        | "date_unavailable"
        | "missing_receiving_contact"
        | "no_active_application"
        | "travelers_incomplete";
    };

export type InternalDateDecisionResult =
  | {
      message: string;
      status: "approved" | "rejected";
    }
  | {
      message: string;
      status:
        | "already_approved"
        | "date_not_found"
        | "insufficient_capacity"
        | "no_requested_date"
        | "not_found";
    };

async function getClientsById(clientIds: string[]) {
  const uniqueClientIds = [...new Set(clientIds)];

  if (uniqueClientIds.length === 0) {
    return new Map<string, InternalClient>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(CLIENT_SELECT)
    .in("id", uniqueClientIds);

  if (error) {
    throw new Error("Could not read clients.");
  }

  return new Map((data ?? []).map((client) => [client.id, client]));
}

function mapApplicationsWithClients(
  applications: InternalApplicationDateBase[],
  clientsById: Map<string, InternalClient>
) {
  return applications.map((application) => ({
    ...application,
    client: clientsById.get(application.client_id) ?? null
  }));
}

function buildDatePayload(input: AvailableDateData) {
  return {
    date: input.date,
    location_city: input.location_city,
    capacity_total: input.capacity_total,
    capacity_available: input.capacity_available,
    status: input.status,
    notes_internal: input.notes_internal
  } satisfies Partial<AvailableDateRow>;
}

export async function getClientAvailableDates() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("available_dates")
    .select(CLIENT_AVAILABLE_DATE_SELECT)
    .in("status", ["available", "limited"])
    .gt("capacity_available", 0)
    .order("date", { ascending: true });

  if (error) {
    throw new Error("Could not read available dates.");
  }

  return data ?? [];
}

export async function getClientDateRequestSetup(clientId: string) {
  const [activeApplication, availableDates] = await Promise.all([
    getActiveApplicationForClient(clientId),
    getClientAvailableDates()
  ]);

  return {
    activeApplication,
    availableDates
  };
}

export async function getClientApplicationDateSummary(
  clientId: string,
  applicationId: string
) {
  const supabase = createSupabaseAdminClient();
  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, client_id, requested_date_id, approved_date_id")
    .eq("id", applicationId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (applicationError) {
    throw new Error("Could not read application date summary.");
  }

  const dateId = application?.approved_date_id ?? application?.requested_date_id;

  if (!dateId) {
    return null;
  }

  const { data, error } = await supabase
    .from("available_dates")
    .select(CLIENT_AVAILABLE_DATE_SELECT)
    .eq("id", dateId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read client application date.");
  }

  return data;
}

export async function requestAvailableDateForClient(
  clientId: string,
  availableDateId: string
): Promise<DateRequestResult> {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      status: "no_active_application",
      message: "Primero debes iniciar tu registro."
    };
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return {
      status: "travelers_incomplete",
      message:
        "Antes de solicitar fecha, agrega a todas las personas incluidas en tu proceso."
    };
  }

  if (!activeApplication.receiving_contact_exists) {
    return {
      status: "missing_receiving_contact",
      message: "Antes de solicitar fecha, agrega la informacion del contacto que recibe."
    };
  }

  if (
    activeApplication.requested_date_status === "approved" ||
    activeApplication.approved_date_id
  ) {
    return {
      status: "already_approved",
      message: "Tu fecha ya fue autorizada. El siguiente paso sera la documentacion."
    };
  }

  if (activeApplication.requested_date_status === "requested") {
    return {
      status: "already_requested",
      message: "Tu fecha fue enviada para revision. Te avisaremos cuando sea autorizada."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: availableDate, error: dateError } = await supabase
    .from("available_dates")
    .select(CLIENT_AVAILABLE_DATE_SELECT)
    .eq("id", availableDateId)
    .maybeSingle();

  if (dateError) {
    throw new Error("Could not read requested date.");
  }

  if (
    !availableDate ||
    !["available", "limited"].includes(availableDate.status) ||
    availableDate.capacity_available <= 0
  ) {
    return {
      status: "date_unavailable",
      message: "La fecha seleccionada ya no esta disponible."
    };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      approved_date_id: null,
      current_stage: APPLICATION_DATE_REQUEST_STAGE,
      progress: APPLICATION_DATE_REQUEST_PROGRESS,
      requested_date_id: availableDate.id,
      requested_date_notes: null,
      requested_date_status: "requested",
      status: "in_review"
    })
    .eq("id", activeApplication.id)
    .eq("client_id", clientId);

  if (error) {
    throw new Error("Could not request available date.");
  }

  return {
    status: "requested",
    message: "Tu fecha fue enviada para revision. Te avisaremos cuando sea autorizada."
  };
}

export async function getInternalAvailableDates() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("available_dates")
    .select(AVAILABLE_DATE_SELECT)
    .order("date", { ascending: true });

  if (error) {
    throw new Error("Could not read internal available dates.");
  }

  const dates = data ?? [];

  if (dates.length === 0) {
    return [];
  }

  const dateIds = dates.map((date) => date.id);
  const { data: relatedApplications, error: applicationsError } = await supabase
    .from("applications")
    .select("id, requested_date_id, approved_date_id")
    .or(
      `requested_date_id.in.(${dateIds.join(",")}),approved_date_id.in.(${dateIds.join(",")})`
    );

  if (applicationsError) {
    throw new Error("Could not read date applications.");
  }

  return dates.map((date) => {
    const requestedApplications = (relatedApplications ?? []).filter(
      (application) => application.requested_date_id === date.id
    );
    const approvedApplications = (relatedApplications ?? []).filter(
      (application) => application.approved_date_id === date.id
    );
    const relatedIds = new Set([
      ...requestedApplications.map((application) => application.id),
      ...approvedApplications.map((application) => application.id)
    ]);

    return {
      ...date,
      approved_applications_count: approvedApplications.length,
      requested_applications_count: requestedApplications.length,
      related_applications_count: relatedIds.size
    };
  });
}

export async function createAvailableDate(input: AvailableDateData) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("available_dates")
    .insert(buildDatePayload(input))
    .select(AVAILABLE_DATE_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Could not create available date.");
  }

  return data;
}

export async function updateAvailableDate(availableDateId: string, input: AvailableDateData) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("available_dates")
    .update(buildDatePayload(input))
    .eq("id", availableDateId)
    .select(AVAILABLE_DATE_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Could not update available date.");
  }

  return data;
}

export async function getInternalAvailableDateDetail(availableDateId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: availableDate, error } = await supabase
    .from("available_dates")
    .select(AVAILABLE_DATE_SELECT)
    .eq("id", availableDateId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read available date detail.");
  }

  if (!availableDate) {
    return null;
  }

  const [requestedResult, approvedResult] = await Promise.all([
    supabase
      .from("applications")
      .select(APPLICATION_DATE_SELECT)
      .eq("requested_date_id", availableDateId)
      .order("updated_at", { ascending: false }),
    supabase
      .from("applications")
      .select(APPLICATION_DATE_SELECT)
      .eq("approved_date_id", availableDateId)
      .order("updated_at", { ascending: false })
  ]);

  if (requestedResult.error || approvedResult.error) {
    throw new Error("Could not read related applications.");
  }

  const applicationsById = new Map<string, InternalApplicationDateBase>();

  for (const application of requestedResult.data ?? []) {
    applicationsById.set(application.id, application);
  }

  for (const application of approvedResult.data ?? []) {
    applicationsById.set(application.id, application);
  }

  const relatedApplications = [...applicationsById.values()];
  const clientsById = await getClientsById(
    relatedApplications.map((application) => application.client_id)
  );
  const requestedApplications = relatedApplications.filter(
    (application) => application.requested_date_id === availableDateId
  );
  const approvedApplications = relatedApplications.filter(
    (application) => application.approved_date_id === availableDateId
  );

  return {
    ...availableDate,
    approved_applications_count: approvedApplications.length,
    approved_people_count: approvedApplications.reduce(
      (total, application) => total + application.total_people,
      0
    ),
    related_applications: mapApplicationsWithClients(relatedApplications, clientsById),
    requested_applications_count: requestedApplications.length,
    requested_people_count: requestedApplications.reduce(
      (total, application) => total + application.total_people,
      0
    )
  } satisfies InternalAvailableDateDetail;
}

async function getApplicationForDecision(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_DATE_SELECT)
    .eq("id", applicationId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read application date request.");
  }

  return data;
}

export async function approveApplicationRequestedDate(
  applicationId: string,
  input: DateDecisionData
): Promise<InternalDateDecisionResult> {
  const application = await getApplicationForDecision(applicationId);

  if (!application) {
    return {
      status: "not_found",
      message: "No encontramos la solicitud."
    };
  }

  if (application.requested_date_status === "approved" && application.approved_date_id) {
    return {
      status: "already_approved",
      message: "Esta solicitud ya tiene fecha autorizada."
    };
  }

  if (!application.requested_date_id) {
    return {
      status: "no_requested_date",
      message: "Esta solicitud no tiene fecha solicitada."
    };
  }

  if (application.requested_date_status !== "requested") {
    return {
      status: "no_requested_date",
      message: "Esta solicitud no tiene una fecha pendiente de autorizacion."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: availableDate, error: dateError } = await supabase
    .from("available_dates")
    .select(AVAILABLE_DATE_SELECT)
    .eq("id", application.requested_date_id)
    .maybeSingle();

  if (dateError) {
    throw new Error("Could not read available date for approval.");
  }

  if (!availableDate) {
    return {
      status: "date_not_found",
      message: "No encontramos la fecha solicitada."
    };
  }

  if (availableDate.capacity_available < application.total_people) {
    return {
      status: "insufficient_capacity",
      message: "No hay cupo suficiente para autorizar esta solicitud."
    };
  }

  const nextCapacityAvailable = availableDate.capacity_available - application.total_people;
  const nextDateStatus = nextCapacityAvailable === 0 ? "full" : availableDate.status;

  const dateUpdate = await supabase
    .from("available_dates")
    .update({
      capacity_available: nextCapacityAvailable,
      status: nextDateStatus
    })
    .eq("id", availableDate.id);

  if (dateUpdate.error) {
    throw new Error("Could not update available date capacity.");
  }

  const applicationUpdate = await supabase
    .from("applications")
    .update({
      approved_date_id: application.requested_date_id,
      current_stage: APPLICATION_DATE_APPROVED_STAGE,
      progress: APPLICATION_DATE_APPROVED_PROGRESS,
      requested_date_notes: input.notes ?? null,
      requested_date_status: "approved",
      status: "active"
    })
    .eq("id", application.id);

  if (applicationUpdate.error) {
    throw new Error("Could not approve requested date.");
  }

  return {
    status: "approved",
    message: "Fecha autorizada correctamente."
  };
}

export async function rejectApplicationRequestedDate(
  applicationId: string,
  input: DateDecisionData
): Promise<InternalDateDecisionResult> {
  const application = await getApplicationForDecision(applicationId);

  if (!application) {
    return {
      status: "not_found",
      message: "No encontramos la solicitud."
    };
  }

  if (!application.requested_date_id) {
    return {
      status: "no_requested_date",
      message: "Esta solicitud no tiene fecha solicitada."
    };
  }

  if (application.requested_date_status !== "requested") {
    return {
      status: "no_requested_date",
      message: "Esta solicitud no tiene una fecha pendiente de decision."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("applications")
    .update({
      approved_date_id: null,
      current_stage: "informacion_inicial",
      progress: 15,
      requested_date_notes: input.notes ?? null,
      requested_date_status: "rejected" satisfies RequestedDateStatus,
      status: "active"
    })
    .eq("id", application.id);

  if (error) {
    throw new Error("Could not reject requested date.");
  }

  return {
    status: "rejected",
    message: "Fecha rechazada. El cliente podra solicitar otra fecha."
  };
}
