import {
  DOCUMENT_STATUS_DESCRIPTIONS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENTATION_PROGRESS,
  DOCUMENTATION_STAGE,
  DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES,
  DOCUMENT_UPLOAD_MAX_SIZE_BYTES,
  GENERAL_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_TYPES,
  REQUIRED_GENERAL_DOCUMENT_TYPES,
  REQUIRED_TRAVELER_DOCUMENT_TYPES,
  TRAVELER_DOCUMENT_LABELS
} from "@/lib/constants";
import { getActiveApplicationForClient } from "@/lib/applications";
import {
  isDocumentationStageOpen,
  shouldShowAutomaticDocumentRequirements,
  shouldShowDocumentUploadForm
} from "@/lib/stages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createDocumentSignedUrl,
  sanitizeStorageFileName,
  uploadPrivateDocumentFile
} from "@/lib/storage";
import type { DocumentStatusUpdateData, DocumentUploadData, DocumentScope } from "@/validations/document";
import type {
  ApplicationRow,
  DocumentRow,
  DocumentStatus,
  MexicoRequirementType,
  TravelerMexicoEntryRequirementRow,
  TravelerRow,
  UserRow
} from "@/types/database";
import type { ApplicationStage } from "@/types/database";

const DOCUMENT_SELECT =
  "id, application_id, traveler_id, mexico_requirement_id, document_type, file_path, file_name, file_mime_type, file_size, status, admin_notes, client_notes, uploaded_by, reviewed_by, created_at, reviewed_at";

const TRAVELER_DOCUMENT_SELECT =
  "id, application_id, full_name, age, nationality, relationship, requires_mexico_entry_review, mexico_entry_status, created_at";

const INTERNAL_APPLICATION_SELECT =
  "id, client_id, main_contact_name, current_stage, progress, status, requested_date_id, approved_date_id, requested_date_status, total_people, created_at, updated_at";

const INTERNAL_CLIENT_SELECT =
  "id, full_name, email, country_code, phone_number, whatsapp_e164, status, created_at";

const MEXICO_REQUIREMENT_SELECT =
  "id, traveler_id, application_id, requirement_type, requirement_name, status, notes_public, notes_internal, created_by, reviewed_by, created_at, updated_at, reviewed_at";

type ClientTraveler = Pick<
  TravelerRow,
  | "age"
  | "application_id"
  | "created_at"
  | "full_name"
  | "id"
  | "mexico_entry_status"
  | "nationality"
  | "relationship"
  | "requires_mexico_entry_review"
>;

type InternalClient = Pick<
  UserRow,
  | "created_at"
  | "email"
  | "full_name"
  | "id"
  | "phone_number"
  | "status"
  | "whatsapp_e164"
  | "country_code"
>;

type InternalApplication = Pick<
  ApplicationRow,
  | "approved_date_id"
  | "client_id"
  | "created_at"
  | "current_stage"
  | "id"
  | "main_contact_name"
  | "progress"
  | "requested_date_id"
  | "requested_date_status"
  | "status"
  | "total_people"
  | "updated_at"
>;

export type ClientDocument = Pick<
  DocumentRow,
  | "admin_notes"
  | "client_notes"
  | "created_at"
  | "document_type"
  | "file_name"
  | "file_size"
  | "id"
  | "status"
>;

export type ClientDocumentRequirement = {
  can_upload: boolean;
  document: ClientDocument | null;
  document_type: string;
  key: string;
  label: string;
  mexico_requirement_id?: string | null;
  scope: DocumentScope;
  status: DocumentStatus;
  status_description: string;
  status_label: string;
  traveler_id?: string | null;
};

export type ClientTravelerDocumentSection = {
  requirements: ClientDocumentRequirement[];
  traveler: ClientTraveler;
};

export type ClientDocumentationSummary = {
  accepted_count: number;
  in_review_count: number;
  pending_count: number;
  replacement_requested_count: number;
  rejected_count: number;
  required_total: number;
  uploaded_count: number;
};

export type ClientDocumentationStageState = {
  is_documentation_open: boolean;
  is_after_documentation: boolean;
};

export type InternalDocumentListItem = Pick<
  DocumentRow,
  | "created_at"
  | "document_type"
  | "file_name"
  | "file_size"
  | "id"
  | "status"
  | "traveler_id"
> & {
  application: InternalApplication | null;
  client: InternalClient | null;
  document_label: string;
  traveler: Pick<TravelerRow, "full_name" | "id"> | null;
};

export type InternalDocumentDetail = Pick<
  DocumentRow,
  | "admin_notes"
  | "application_id"
  | "client_notes"
  | "created_at"
  | "document_type"
  | "file_name"
  | "file_mime_type"
  | "file_path"
  | "file_size"
  | "id"
  | "mexico_requirement_id"
  | "reviewed_at"
  | "status"
  | "traveler_id"
> & {
  application: InternalApplication | null;
  client: InternalClient | null;
  document_label: string;
  mexico_requirement: Pick<
    TravelerMexicoEntryRequirementRow,
    "id" | "requirement_name" | "requirement_type" | "status"
  > | null;
  traveler: Pick<TravelerRow, "full_name" | "id"> | null;
};

export type DocumentUploadResult =
  | {
      document: ClientDocument;
      message: string;
      status: "uploaded";
    }
  | {
      message: string;
      status:
        | "date_required"
        | "file_invalid"
        | "missing_receiving_contact"
        | "no_active_application"
        | "not_allowed"
        | "travelers_incomplete";
    };

export type InternalDocumentStatusResult =
  | {
      message: string;
      status: "updated";
    }
  | {
      message: string;
      status: "not_found";
    };

function getMexicoRequirementTypeForDocument(documentType: string): MexicoRequirementType {
  if (documentType === "address_reference") {
    return "hotel_or_address_reference";
  }

  return documentType as MexicoRequirementType;
}

export function getDocumentLabel(documentType: string) {
  if (documentType in GENERAL_DOCUMENT_LABELS) {
    return GENERAL_DOCUMENT_LABELS[documentType as keyof typeof GENERAL_DOCUMENT_LABELS];
  }

  if (documentType in TRAVELER_DOCUMENT_LABELS) {
    return TRAVELER_DOCUMENT_LABELS[documentType as keyof typeof TRAVELER_DOCUMENT_LABELS];
  }

  if (documentType in MEXICO_REVIEW_DOCUMENT_LABELS) {
    return MEXICO_REVIEW_DOCUMENT_LABELS[documentType as keyof typeof MEXICO_REVIEW_DOCUMENT_LABELS];
  }

  return documentType;
}

function toClientDocument(document: DocumentRow): ClientDocument {
  return {
    admin_notes: document.admin_notes,
    client_notes: document.client_notes,
    created_at: document.created_at,
    document_type: document.document_type,
    file_name: document.file_name,
    file_size: document.file_size,
    id: document.id,
    status: document.status
  };
}

function makeRequirement({
  document,
  documentType,
  key,
  label,
  mexicoRequirementId = null,
  scope,
  currentStage,
  travelerId = null
}: {
  currentStage: ApplicationStage;
  document: DocumentRow | null;
  documentType: string;
  key: string;
  label: string;
  mexicoRequirementId?: string | null;
  scope: DocumentScope;
  travelerId?: string | null;
}): ClientDocumentRequirement {
  const status = document?.status ?? "pending";

  return {
    document: document ? toClientDocument(document) : null,
    document_type: documentType,
    key,
    label,
    can_upload: shouldShowDocumentUploadForm({
      currentStage,
      document
    }),
    mexico_requirement_id: mexicoRequirementId,
    scope,
    status,
    status_description: DOCUMENT_STATUS_DESCRIPTIONS[status],
    status_label: DOCUMENT_STATUS_LABELS[status],
    traveler_id: travelerId
  };
}

function findLatestDocument(
  documents: DocumentRow[],
  {
    documentType,
    mexicoRequirementId = null,
    scope,
    travelerId = null
  }: {
    documentType: string;
    mexicoRequirementId?: string | null;
    scope: DocumentScope;
    travelerId?: string | null;
  }
) {
  return (
    documents.find((document) => {
      if (document.document_type !== documentType) {
        return false;
      }

      if (scope === "application") {
        return !document.traveler_id && !document.mexico_requirement_id;
      }

      if (scope === "traveler") {
        return document.traveler_id === travelerId && !document.mexico_requirement_id;
      }

      if (mexicoRequirementId) {
        return document.mexico_requirement_id === mexicoRequirementId;
      }

      return document.traveler_id === travelerId && Boolean(document.mexico_requirement_id);
    }) ?? null
  );
}

function buildSummary(requirements: ClientDocumentRequirement[]): ClientDocumentationSummary {
  return requirements.reduce<ClientDocumentationSummary>(
    (summary, requirement) => {
      summary.required_total += 1;

      if (!requirement.document) {
        summary.pending_count += 1;
        return summary;
      }

      if (requirement.status === "accepted") {
        summary.accepted_count += 1;
      }

      if (requirement.status === "in_review") {
        summary.in_review_count += 1;
      }

      if (requirement.status === "rejected") {
        summary.rejected_count += 1;
      }

      if (requirement.status === "replacement_requested") {
        summary.replacement_requested_count += 1;
      }

      if (requirement.status !== "pending") {
        summary.uploaded_count += 1;
      }

      return summary;
    },
    {
      accepted_count: 0,
      in_review_count: 0,
      pending_count: 0,
      rejected_count: 0,
      replacement_requested_count: 0,
      required_total: 0,
      uploaded_count: 0
    }
  );
}

function hasDateForDocumentation(application: {
  approved_date_id: string | null;
  requested_date_id: string | null;
}) {
  return Boolean(application.approved_date_id || application.requested_date_id);
}

async function getTravelersForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("travelers")
    .select(TRAVELER_DOCUMENT_SELECT)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Could not read travelers for documentation.");
  }

  return data ?? [];
}

async function getDocumentsForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not read documents.");
  }

  return data ?? [];
}

async function getMexicoRequirementsForApplication(applicationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("traveler_mexico_entry_requirements")
    .select(MEXICO_REQUIREMENT_SELECT)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error("Could not read Mexico requirements.");
  }

  return data ?? [];
}

function filterSuggestedRequirements({
  includeSuggestedDocuments,
  requirements
}: {
  includeSuggestedDocuments: boolean;
  requirements: ClientDocumentRequirement[];
}) {
  if (includeSuggestedDocuments) {
    return requirements;
  }

  return requirements.filter((requirement) => requirement.document);
}

function buildClientRequirements({
  currentStage,
  documents,
  includeSuggestedDocuments,
  mexicoRequirements,
  travelers
}: {
  currentStage: ApplicationStage;
  documents: DocumentRow[];
  includeSuggestedDocuments: boolean;
  mexicoRequirements: TravelerMexicoEntryRequirementRow[];
  travelers: ClientTraveler[];
}) {
  const generalRequirements = filterSuggestedRequirements({
    includeSuggestedDocuments,
    requirements: REQUIRED_GENERAL_DOCUMENT_TYPES.map((documentType) =>
      makeRequirement({
        currentStage,
        document: findLatestDocument(documents, {
          documentType,
          scope: "application"
        }),
        documentType,
        key: `general-${documentType}`,
        label: GENERAL_DOCUMENT_LABELS[documentType],
        scope: "application"
      })
    )
  });

  const travelerSections = travelers
    .map((traveler) => ({
      traveler,
      requirements: filterSuggestedRequirements({
        includeSuggestedDocuments,
        requirements: REQUIRED_TRAVELER_DOCUMENT_TYPES.map((documentType) =>
          makeRequirement({
            currentStage,
            document: findLatestDocument(documents, {
              documentType,
              scope: "traveler",
              travelerId: traveler.id
            }),
            documentType,
            key: `traveler-${traveler.id}-${documentType}`,
            label: TRAVELER_DOCUMENT_LABELS[documentType],
            scope: "traveler",
            travelerId: traveler.id
          })
        )
      })
    }))
    .filter((section) => includeSuggestedDocuments || section.requirements.length > 0);

  const mexicoSections = travelers
    .filter((traveler) => traveler.requires_mexico_entry_review)
    .map((traveler) => ({
      traveler,
      requirements: filterSuggestedRequirements({
        includeSuggestedDocuments,
        requirements: MEXICO_REVIEW_DOCUMENT_TYPES.map((documentType) => {
          const mexicoRequirement = mexicoRequirements.find(
            (requirement) =>
              requirement.traveler_id === traveler.id &&
              requirement.requirement_type === getMexicoRequirementTypeForDocument(documentType)
          );

          return makeRequirement({
            currentStage,
            document: findLatestDocument(documents, {
              documentType,
              mexicoRequirementId: mexicoRequirement?.id,
              scope: "mexico_requirement",
              travelerId: traveler.id
            }),
            documentType,
            key: `mexico-${traveler.id}-${documentType}`,
            label: MEXICO_REVIEW_DOCUMENT_LABELS[documentType],
            mexicoRequirementId: mexicoRequirement?.id ?? null,
            scope: "mexico_requirement",
            travelerId: traveler.id
          });
        })
      })
    }))
    .filter((section) => includeSuggestedDocuments || section.requirements.length > 0);

  const allRequirements = [
    ...generalRequirements,
    ...travelerSections.flatMap((section) => section.requirements),
    ...mexicoSections.flatMap((section) => section.requirements)
  ];

  return {
    allRequirements,
    generalRequirements,
    mexicoSections,
    summary: buildSummary(allRequirements),
    travelerSections
  };
}

export async function getClientDocumentationSetup(clientId: string) {
  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication) {
    return {
      activeApplication: null,
      documentationStageState: {
        is_after_documentation: false,
        is_documentation_open: false
      },
      generalRequirements: [],
      mexicoSections: [],
      summary: null,
      travelerSections: []
    };
  }

  const [travelers, documents, mexicoRequirements] = await Promise.all([
    getTravelersForApplication(activeApplication.id),
    getDocumentsForApplication(activeApplication.id),
    getMexicoRequirementsForApplication(activeApplication.id)
  ]);
  const documentationStageState = {
    is_after_documentation: !isDocumentationStageOpen(activeApplication.current_stage),
    is_documentation_open: isDocumentationStageOpen(activeApplication.current_stage)
  };
  const requirements = buildClientRequirements({
    currentStage: activeApplication.current_stage,
    documents,
    includeSuggestedDocuments: shouldShowAutomaticDocumentRequirements(
      activeApplication.current_stage
    ),
    mexicoRequirements,
    travelers
  });

  return {
    activeApplication,
    documentationStageState,
    generalRequirements: requirements.generalRequirements,
    mexicoSections: requirements.mexicoSections,
    summary: requirements.summary,
    travelerSections: requirements.travelerSections
  };
}

async function ensureMexicoRequirement({
  applicationId,
  documentType,
  travelerId
}: {
  applicationId: string;
  documentType: string;
  travelerId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const requirementType = getMexicoRequirementTypeForDocument(documentType);
  const { data: existing, error } = await supabase
    .from("traveler_mexico_entry_requirements")
    .select(MEXICO_REQUIREMENT_SELECT)
    .eq("application_id", applicationId)
    .eq("traveler_id", travelerId)
    .eq("requirement_type", requirementType)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read Mexico requirement.");
  }

  if (existing) {
    return existing;
  }

  const { data, error: insertError } = await supabase
    .from("traveler_mexico_entry_requirements")
    .insert({
      application_id: applicationId,
      traveler_id: travelerId,
      requirement_type: requirementType,
      requirement_name: getDocumentLabel(documentType),
      status: "requested"
    })
    .select(MEXICO_REQUIREMENT_SELECT)
    .single();

  if (insertError || !data) {
    throw new Error("Could not create Mexico requirement.");
  }

  return data;
}

function validateFile(file: File) {
  if (!file || file.size === 0) {
    return "Selecciona un archivo.";
  }

  if (file.size > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
    return "El archivo no debe superar 10 MB.";
  }

  if (![...DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES].includes(file.type as never)) {
    return "Solo puedes subir PDF, JPG, JPEG, PNG o WEBP.";
  }

  return null;
}

function buildDocumentFilePath({
  applicationId,
  documentType,
  fileName,
  mexicoRequirementId,
  scope,
  travelerId
}: {
  applicationId: string;
  documentType: string;
  fileName: string;
  mexicoRequirementId?: string | null;
  scope: DocumentScope;
  travelerId?: string | null;
}) {
  const timestamp = Date.now();
  const safeFileName = sanitizeStorageFileName(fileName);

  if (scope === "traveler" && travelerId) {
    return `applications/${applicationId}/travelers/${travelerId}/${documentType}/${timestamp}-${safeFileName}`;
  }

  if (scope === "mexico_requirement" && mexicoRequirementId) {
    return `applications/${applicationId}/mexico-requirements/${mexicoRequirementId}/${documentType}/${timestamp}-${safeFileName}`;
  }

  return `applications/${applicationId}/general/${documentType}/${timestamp}-${safeFileName}`;
}

async function findExistingDocumentRecord({
  applicationId,
  documentType,
  mexicoRequirementId,
  scope,
  travelerId
}: {
  applicationId: string;
  documentType: string;
  mexicoRequirementId?: string | null;
  scope: DocumentScope;
  travelerId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("application_id", applicationId)
    .eq("document_type", documentType)
    .order("created_at", { ascending: true })
    .limit(1);

  if (scope === "application") {
    query = query.is("traveler_id", null).is("mexico_requirement_id", null);
  }

  if (scope === "traveler") {
    query = query.eq("traveler_id", travelerId ?? "").is("mexico_requirement_id", null);
  }

  if (scope === "mexico_requirement") {
    query = query.eq("mexico_requirement_id", mexicoRequirementId ?? "");
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error("Could not read existing document.");
  }

  return data;
}

async function logDocumentActivity({
  action,
  applicationId,
  documentId,
  userId
}: {
  action: string;
  applicationId: string;
  documentId: string;
  userId: string | null;
}) {
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("activity_logs").insert({
      action,
      application_id: applicationId,
      entity_id: documentId,
      entity_type: "document",
      metadata: {},
      user_id: userId
    });
  } catch {
    // Activity logging is helpful, but it should not block the document workflow.
  }
}

export async function uploadDocumentForClient(
  clientId: string,
  input: DocumentUploadData,
  file: File
): Promise<DocumentUploadResult> {
  const fileError = validateFile(file);

  if (fileError) {
    return {
      status: "file_invalid",
      message: fileError
    };
  }

  const activeApplication = await getActiveApplicationForClient(clientId);

  if (!activeApplication || activeApplication.id !== input.application_id) {
    return {
      status: "no_active_application",
      message: "Primero debes iniciar tu registro."
    };
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return {
      status: "travelers_incomplete",
      message:
        "Antes de subir documentacion, agrega a todas las personas incluidas en tu proceso."
    };
  }

  if (!activeApplication.receiving_contact_exists) {
    return {
      status: "missing_receiving_contact",
      message: "Antes de subir documentacion, agrega el contacto que recibe."
    };
  }

  if (!hasDateForDocumentation(activeApplication)) {
    return {
      status: "date_required",
      message: "Antes de subir documentacion, solicita una fecha disponible."
    };
  }

  const supabase = createSupabaseAdminClient();
  let traveler: ClientTraveler | null = null;

  if (input.scope === "traveler" || input.scope === "mexico_requirement") {
    const { data, error } = await supabase
      .from("travelers")
      .select(TRAVELER_DOCUMENT_SELECT)
      .eq("id", input.traveler_id ?? "")
      .eq("application_id", activeApplication.id)
      .maybeSingle();

    if (error) {
      throw new Error("Could not read traveler for document upload.");
    }

    if (!data) {
      return {
        status: "not_allowed",
        message: "La persona seleccionada no pertenece a tu solicitud."
      };
    }

    traveler = data;
  }

  if (input.scope === "mexico_requirement" && !traveler?.requires_mexico_entry_review) {
    return {
      status: "not_allowed",
      message: "Este documento no corresponde a la revision documental de Mexico."
    };
  }

  const mexicoRequirement =
    input.scope === "mexico_requirement" && input.traveler_id
      ? await ensureMexicoRequirement({
          applicationId: activeApplication.id,
          documentType: input.document_type,
          travelerId: input.traveler_id
        })
      : null;
  const existingDocument = await findExistingDocumentRecord({
    applicationId: activeApplication.id,
    documentType: input.document_type,
    mexicoRequirementId: mexicoRequirement?.id,
    scope: input.scope,
    travelerId: input.traveler_id
  });

  if (
    existingDocument &&
    (existingDocument.status === "uploaded" ||
      existingDocument.status === "in_review" ||
      existingDocument.status === "accepted")
  ) {
    return {
      status: "not_allowed",
      message:
        "Este documento ya fue recibido. Solo podras subir reemplazo si el equipo lo solicita."
    };
  }

  if (
    !shouldShowDocumentUploadForm({
      currentStage: activeApplication.current_stage,
      document: existingDocument
    })
  ) {
    return {
      status: "not_allowed",
      message:
        "La etapa documental ya fue revisada. Solo puedes subir reemplazos solicitados por el equipo."
    };
  }

  const filePath = buildDocumentFilePath({
    applicationId: activeApplication.id,
    documentType: input.document_type,
    fileName: file.name,
    mexicoRequirementId: mexicoRequirement?.id,
    scope: input.scope,
    travelerId: input.traveler_id
  });
  const fileBuffer = await file.arrayBuffer();

  await uploadPrivateDocumentFile({
    contentType: file.type,
    file: fileBuffer,
    filePath
  });

  const payload = {
    application_id: activeApplication.id,
    traveler_id: input.scope === "application" ? null : input.traveler_id ?? null,
    mexico_requirement_id: mexicoRequirement?.id ?? null,
    document_type: input.document_type,
    file_path: filePath,
    file_name: file.name,
    file_mime_type: file.type,
    file_size: file.size,
    status: "uploaded" as DocumentStatus,
    admin_notes: null,
    client_notes: input.client_notes ?? null,
    uploaded_by: clientId,
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString()
  };
  const result = existingDocument
    ? await supabase
        .from("documents")
        .update(payload)
        .eq("id", existingDocument.id)
        .select(DOCUMENT_SELECT)
        .single()
    : await supabase.from("documents").insert(payload).select(DOCUMENT_SELECT).single();

  if (result.error || !result.data) {
    throw new Error("Could not save document record.");
  }

  if (
    (activeApplication.approved_date_id ||
      activeApplication.requested_date_status === "approved") &&
    activeApplication.progress < DOCUMENTATION_PROGRESS
  ) {
    await supabase
      .from("applications")
      .update({
        current_stage: DOCUMENTATION_STAGE,
        progress: DOCUMENTATION_PROGRESS
      })
      .eq("id", activeApplication.id)
      .eq("client_id", clientId);
  }

  await logDocumentActivity({
    action: existingDocument ? "document_replaced" : "document_uploaded",
    applicationId: activeApplication.id,
    documentId: result.data.id,
    userId: clientId
  });

  return {
    status: "uploaded",
    message: "Documento recibido. Esta pendiente de revision.",
    document: toClientDocument(result.data)
  };
}

export async function createClientDocumentSignedUrl(clientId: string, documentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("id", documentId)
    .maybeSingle();

  if (error || !document?.file_path) {
    return null;
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, client_id")
    .eq("id", document.application_id)
    .maybeSingle();

  if (applicationError || application?.client_id !== clientId) {
    return null;
  }

  return createDocumentSignedUrl(document.file_path);
}

export async function createInternalDocumentSignedUrl(documentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("id", documentId)
    .maybeSingle();

  if (error || !document?.file_path) {
    return null;
  }

  return createDocumentSignedUrl(document.file_path);
}

async function getApplicationsById(applicationIds: string[]) {
  const uniqueIds = [...new Set(applicationIds)];

  if (uniqueIds.length === 0) {
    return new Map<string, InternalApplication>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select(INTERNAL_APPLICATION_SELECT)
    .in("id", uniqueIds);

  if (error) {
    throw new Error("Could not read document applications.");
  }

  return new Map((data ?? []).map((application) => [application.id, application]));
}

async function getClientsById(clientIds: string[]) {
  const uniqueIds = [...new Set(clientIds)];

  if (uniqueIds.length === 0) {
    return new Map<string, InternalClient>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("users").select(INTERNAL_CLIENT_SELECT).in("id", uniqueIds);

  if (error) {
    throw new Error("Could not read document clients.");
  }

  return new Map((data ?? []).map((client) => [client.id, client]));
}

async function getTravelersById(travelerIds: string[]) {
  const uniqueIds = [...new Set(travelerIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map<string, Pick<TravelerRow, "full_name" | "id">>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("travelers")
    .select("id, full_name")
    .in("id", uniqueIds);

  if (error) {
    throw new Error("Could not read document travelers.");
  }

  return new Map((data ?? []).map((traveler) => [traveler.id, traveler]));
}

export async function getInternalDocuments() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Could not read internal documents.");
  }

  const documents = data ?? [];
  const applicationsById = await getApplicationsById(
    documents.map((document) => document.application_id)
  );
  const clientsById = await getClientsById(
    [...applicationsById.values()].map((application) => application.client_id)
  );
  const travelersById = await getTravelersById(
    documents.map((document) => document.traveler_id ?? "")
  );

  return documents.map((document) => {
    const application = applicationsById.get(document.application_id) ?? null;

    return {
      created_at: document.created_at,
      document_label: getDocumentLabel(document.document_type),
      document_type: document.document_type,
      file_name: document.file_name,
      file_size: document.file_size,
      id: document.id,
      status: document.status,
      traveler_id: document.traveler_id,
      application,
      client: application ? clientsById.get(application.client_id) ?? null : null,
      traveler: document.traveler_id ? travelersById.get(document.traveler_id) ?? null : null
    } satisfies InternalDocumentListItem;
  });
}

export async function getInternalDocumentDetail(documentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: document, error } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not read internal document detail.");
  }

  if (!document) {
    return null;
  }

  const [applicationsById, travelersById] = await Promise.all([
    getApplicationsById([document.application_id]),
    getTravelersById([document.traveler_id ?? ""])
  ]);
  const application = applicationsById.get(document.application_id) ?? null;
  const clientsById = await getClientsById(application ? [application.client_id] : []);
  const { data: requirement, error: requirementError } = document.mexico_requirement_id
    ? await supabase
        .from("traveler_mexico_entry_requirements")
        .select("id, requirement_type, requirement_name, status")
        .eq("id", document.mexico_requirement_id)
        .maybeSingle()
    : { data: null, error: null };

  if (requirementError) {
    throw new Error("Could not read document requirement.");
  }

  return {
    admin_notes: document.admin_notes,
    application_id: document.application_id,
    client_notes: document.client_notes,
    created_at: document.created_at,
    document_label: getDocumentLabel(document.document_type),
    document_type: document.document_type,
    file_mime_type: document.file_mime_type,
    file_name: document.file_name,
    file_path: document.file_path,
    file_size: document.file_size,
    id: document.id,
    mexico_requirement_id: document.mexico_requirement_id,
    reviewed_at: document.reviewed_at,
    status: document.status,
    traveler_id: document.traveler_id,
    application,
    client: application ? clientsById.get(application.client_id) ?? null : null,
    mexico_requirement: requirement,
    traveler: document.traveler_id ? travelersById.get(document.traveler_id) ?? null : null
  } satisfies InternalDocumentDetail;
}

export async function updateInternalDocumentStatus(
  documentId: string,
  input: DocumentStatusUpdateData
): Promise<InternalDocumentStatusResult> {
  const supabase = createSupabaseAdminClient();
  const { data: document, error: readError } = await supabase
    .from("documents")
    .select(DOCUMENT_SELECT)
    .eq("id", documentId)
    .maybeSingle();

  if (readError) {
    throw new Error("Could not read document for status update.");
  }

  if (!document) {
    return {
      status: "not_found",
      message: "No encontramos el documento."
    };
  }

  const shouldMarkReviewed =
    input.status === "accepted" ||
    input.status === "rejected" ||
    input.status === "replacement_requested";
  const { error } = await supabase
    .from("documents")
    .update({
      admin_notes: input.admin_notes ?? null,
      reviewed_at: shouldMarkReviewed ? new Date().toISOString() : document.reviewed_at,
      reviewed_by: null,
      status: input.status
    })
    .eq("id", documentId);

  if (error) {
    throw new Error("Could not update document status.");
  }

  await logDocumentActivity({
    action: `document_${input.status}`,
    applicationId: document.application_id,
    documentId,
    userId: null
  });

  return {
    status: "updated",
    message: "Estado del documento actualizado."
  };
}

export async function getApplicationDocumentSummary(
  applicationId: string,
  currentStage: ApplicationStage = DOCUMENTATION_STAGE
) {
  const [travelers, documents, mexicoRequirements] = await Promise.all([
    getTravelersForApplication(applicationId),
    getDocumentsForApplication(applicationId),
    getMexicoRequirementsForApplication(applicationId)
  ]);
  const requirements = buildClientRequirements({
    currentStage,
    documents,
    includeSuggestedDocuments: shouldShowAutomaticDocumentRequirements(currentStage),
    mexicoRequirements,
    travelers
  });

  return {
    documents,
    summary: requirements.summary
  };
}
