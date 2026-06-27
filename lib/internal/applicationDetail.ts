import {
  DOCUMENT_STATUS_LABELS,
  GENERAL_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_TYPES,
  REQUIRED_GENERAL_DOCUMENT_TYPES,
  REQUIRED_TRAVELER_DOCUMENT_TYPES,
  REQUESTED_DATE_STATUS_LABELS,
  TRAVELER_DOCUMENT_LABELS
} from "@/lib/constants";
import type { InternalApplicationDetail } from "@/lib/internal/queries";
import type { DocumentStatus } from "@/types/database";

export type UnifiedRowStatus =
  | "Aceptado"
  | "Autorizado"
  | "Cargado"
  | "Completo"
  | "En revision"
  | "No aplica"
  | "Pendiente"
  | "Rechazado"
  | "Reemplazo solicitado"
  | "Requiere accion";

export type UnifiedRowPriority = "Alta" | "Media" | "Baja";

export type UnifiedRowActionType =
  | "approve_date"
  | "none"
  | "review_requirement"
  | "upcoming"
  | "view_document";

export type ApplicationUnifiedDocument = {
  adminNotes: string | null;
  clientNotes: string | null;
  createdAt: string;
  documentLabel: string;
  fileMimeType: string | null;
  fileName: string | null;
  fileSize: number | null;
  id: string;
  relatedTo: string;
  status: DocumentStatus;
};

export type ApplicationUnifiedRow = {
  actionLabel: string;
  actionType: UnifiedRowActionType;
  area: string;
  detail: string;
  document?: ApplicationUnifiedDocument;
  documentId?: string;
  id: string;
  mainData: string;
  personOrRelation: string;
  priority: UnifiedRowPriority;
  relatedId?: string;
  responsible: "Cliente" | "Interno" | "Sistema";
  status: UnifiedRowStatus;
};

function hasValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value > 0;
  }

  return Boolean(value?.trim());
}

function joinDetails(values: Array<number | string | null | undefined>) {
  const filtered = values.filter((value) => {
    if (typeof value === "number") {
      return Number.isFinite(value);
    }

    return Boolean(value?.trim());
  });

  return filtered.length > 0 ? filtered.join(" / ") : "Sin dato";
}

function getDocumentStatus(status: DocumentStatus): UnifiedRowStatus {
  const statusMap: Record<DocumentStatus, UnifiedRowStatus> = {
    accepted: "Aceptado",
    in_review: "En revision",
    pending: "Pendiente",
    rejected: "Rechazado",
    replacement_requested: "Reemplazo solicitado",
    uploaded: "Cargado"
  };

  return statusMap[status];
}

function getDocumentPriority(status: DocumentStatus): UnifiedRowPriority {
  if (status === "rejected" || status === "replacement_requested") {
    return "Alta";
  }

  if (status === "pending" || status === "uploaded" || status === "in_review") {
    return "Media";
  }

  return "Baja";
}

function getDocumentResponsible(status: DocumentStatus) {
  if (status === "uploaded" || status === "in_review") {
    return "Interno" as const;
  }

  return "Cliente" as const;
}

function getDateStatus(application: InternalApplicationDetail): UnifiedRowStatus {
  if (application.requested_date_status === "approved" || application.approved_date_id) {
    return "Autorizado";
  }

  if (application.requested_date_status === "requested") {
    return "En revision";
  }

  if (application.requested_date_status === "rejected") {
    return "Rechazado";
  }

  return "Pendiente";
}

function getDateResponsible(application: InternalApplicationDetail) {
  if (application.requested_date_status === "requested") {
    return "Interno" as const;
  }

  return "Cliente" as const;
}

function findDocument(
  application: InternalApplicationDetail,
  {
    documentType,
    isMexico = false,
    travelerId = null
  }: {
    documentType: string;
    isMexico?: boolean;
    travelerId?: string | null;
  }
) {
  return (
    application.documents.find((document) => {
      if (document.document_type !== documentType) {
        return false;
      }

      if (!travelerId) {
        return !document.traveler_id && !document.mexico_requirement_id;
      }

      if (isMexico) {
        return document.traveler_id === travelerId && Boolean(document.mexico_requirement_id);
      }

      return document.traveler_id === travelerId && !document.mexico_requirement_id;
    }) ?? null
  );
}

function makeDocumentRow({
  area,
  document,
  documentLabel,
  id,
  relatedTo
}: {
  area: "Documento" | "Requisito Mexico";
  document: InternalApplicationDetail["documents"][number] | null;
  documentLabel: string;
  id: string;
  relatedTo: string;
}): ApplicationUnifiedRow {
  if (!document) {
    return {
      actionLabel: "Solicitar",
      actionType: "upcoming",
      area,
      detail: "Pendiente de carga",
      id,
      mainData: documentLabel,
      personOrRelation: relatedTo,
      priority: "Media",
      responsible: "Cliente",
      status: "Pendiente"
    };
  }

  const status = getDocumentStatus(document.status);

  return {
    actionLabel: document.file_name ? "Ver archivo" : "Revisar",
    actionType: document.file_name ? "view_document" : "upcoming",
    area,
    detail: document.file_name ?? DOCUMENT_STATUS_LABELS[document.status],
    document: {
      adminNotes: document.admin_notes,
      clientNotes: document.client_notes,
      createdAt: document.created_at,
      documentLabel,
      fileMimeType: document.file_mime_type,
      fileName: document.file_name,
      fileSize: document.file_size,
      id: document.id,
      relatedTo,
      status: document.status
    },
    documentId: document.id,
    id,
    mainData: documentLabel,
    personOrRelation: relatedTo,
    priority: getDocumentPriority(document.status),
    relatedId: document.id,
    responsible: getDocumentResponsible(document.status),
    status
  };
}

function getTravelerStatus(
  traveler: InternalApplicationDetail["travelers"][number]
): UnifiedRowStatus {
  const requiredValues = [traveler.full_name, traveler.nationality, traveler.relationship];

  return requiredValues.every(hasValue) ? "Completo" : "Requiere accion";
}

function getMexicoRequirementStatus(
  application: InternalApplicationDetail,
  travelerId: string
): UnifiedRowStatus {
  const mexicoDocuments = MEXICO_REVIEW_DOCUMENT_TYPES.map((documentType) =>
    findDocument(application, {
      documentType,
      isMexico: true,
      travelerId
    })
  );

  if (mexicoDocuments.every((document) => document?.status === "accepted")) {
    return "Aceptado";
  }

  if (
    mexicoDocuments.some(
      (document) => document?.status === "rejected" || document?.status === "replacement_requested"
    )
  ) {
    return "Requiere accion";
  }

  if (
    mexicoDocuments.some(
      (document) => document?.status === "uploaded" || document?.status === "in_review"
    )
  ) {
    return "En revision";
  }

  return "Pendiente";
}

export function buildApplicationUnifiedRows(
  application: InternalApplicationDetail
): ApplicationUnifiedRow[] {
  const clientName =
    application.main_contact_name ||
    application.client?.full_name ||
    application.client?.email ||
    "Cliente sin nombre";
  const rows: ApplicationUnifiedRow[] = [
    {
      actionLabel: "Sin accion",
      actionType: "none",
      area: "Cliente",
      detail: joinDetails([application.client?.whatsapp_e164, application.client?.email]),
      id: "client-main",
      mainData: clientName,
      personOrRelation: "Cliente principal",
      priority: hasValue(application.client?.whatsapp_e164) ? "Baja" : "Media",
      relatedId: application.client?.id,
      responsible: "Cliente",
      status: hasValue(clientName) && hasValue(application.client?.whatsapp_e164)
        ? "Completo"
        : "Requiere accion"
    },
    {
      actionLabel: "Sin accion",
      actionType: "none",
      area: "Solicitud",
      detail: joinDetails([
        `Origen: ${joinDetails([application.origin_country, application.origin_city])}`,
        `Destino: ${joinDetails([application.arrival_country, application.arrival_city])}`,
        `${application.total_people} persona(s)`
      ]),
      id: "application-summary",
      mainData: application.process_reason ?? "Motivo no especificado",
      personOrRelation: "Grupo completo",
      priority: application.process_reason ? "Baja" : "Media",
      relatedId: application.id,
      responsible: "Cliente",
      status:
        hasValue(application.origin_country) &&
        hasValue(application.origin_city) &&
        hasValue(application.total_people)
          ? "Completo"
          : "Requiere accion"
    }
  ];

  for (const traveler of application.travelers) {
    const status = getTravelerStatus(traveler);

    rows.push({
      actionLabel: "Sin accion",
      actionType: "none",
      area: "Viajero",
      detail: joinDetails([
        traveler.age ? `Edad: ${traveler.age}` : null,
        traveler.whatsapp_e164 ? `WhatsApp: ${traveler.whatsapp_e164}` : null,
        traveler.is_main_client ? "Cliente principal" : null
      ]),
      id: `traveler-${traveler.id}`,
      mainData: traveler.nationality ? `Nacionalidad: ${traveler.nationality}` : "Nacionalidad pendiente",
      personOrRelation: joinDetails([traveler.full_name, traveler.relationship]),
      priority: status === "Completo" ? "Baja" : "Media",
      relatedId: traveler.id,
      responsible: "Cliente",
      status
    });
  }

  if (application.travelers.length < application.total_people) {
    rows.push({
      actionLabel: "Esperar cliente",
      actionType: "none",
      area: "Viajero",
      detail: `${application.travelers.length} de ${application.total_people} persona(s) agregadas`,
      id: "traveler-missing",
      mainData: "Faltan personas que viajan",
      personOrRelation: "Grupo completo",
      priority: "Alta",
      responsible: "Cliente",
      status: "Pendiente"
    });
  }

  if (application.receiving_contact) {
    rows.push({
      actionLabel: "Sin accion",
      actionType: "none",
      area: "Contacto que recibe",
      detail: joinDetails([
        application.receiving_contact.whatsapp_e164,
        application.receiving_contact.address_reference
      ]),
      id: `receiving-contact-${application.receiving_contact.id}`,
      mainData: joinDetails([
        application.receiving_contact.state_name,
        application.receiving_contact.city_other ?? application.receiving_contact.city_name
      ]),
      personOrRelation: joinDetails([
        application.receiving_contact.full_name,
        application.receiving_contact.relationship
      ]),
      priority: hasValue(application.receiving_contact.whatsapp_e164) ? "Baja" : "Media",
      relatedId: application.receiving_contact.id,
      responsible: "Cliente",
      status:
        hasValue(application.receiving_contact.full_name) &&
        hasValue(application.receiving_contact.whatsapp_e164) &&
        hasValue(application.receiving_contact.address_reference)
          ? "Completo"
          : "Requiere accion"
    });
  } else {
    rows.push({
      actionLabel: "Esperar cliente",
      actionType: "none",
      area: "Contacto que recibe",
      detail: "Sin contacto registrado",
      id: "receiving-contact-missing",
      mainData: "Falta contacto que recibe",
      personOrRelation: "Destino",
      priority: "Alta",
      responsible: "Cliente",
      status: "Pendiente"
    });
  }

  rows.push({
    actionLabel: application.requested_date_status === "requested" ? "Autorizar / rechazar" : "Sin accion",
    actionType: application.requested_date_status === "requested" ? "approve_date" : "none",
    area: "Fecha",
    detail: joinDetails([
      application.requested_date?.date
        ? `Solicitada: ${application.requested_date.date}`
        : "Sin fecha solicitada",
      application.approved_date?.date ? `Autorizada: ${application.approved_date.date}` : null,
      application.requested_date?.location_city ?? application.approved_date?.location_city
    ]),
    id: "date-row",
    mainData: REQUESTED_DATE_STATUS_LABELS[application.requested_date_status],
    personOrRelation: "Grupo completo",
    priority: application.requested_date_status === "requested" ? "Alta" : "Media",
    relatedId: application.requested_date_id ?? application.approved_date_id ?? undefined,
    responsible: getDateResponsible(application),
    status: getDateStatus(application)
  });

  for (const documentType of REQUIRED_GENERAL_DOCUMENT_TYPES) {
    rows.push(
      makeDocumentRow({
        area: "Documento",
        document: findDocument(application, { documentType }),
        documentLabel: GENERAL_DOCUMENT_LABELS[documentType],
        id: `document-general-${documentType}`,
        relatedTo: "Solicitud"
      })
    );
  }

  for (const traveler of application.travelers) {
    for (const documentType of REQUIRED_TRAVELER_DOCUMENT_TYPES) {
      rows.push(
        makeDocumentRow({
          area: "Documento",
          document: findDocument(application, {
            documentType,
            travelerId: traveler.id
          }),
          documentLabel: TRAVELER_DOCUMENT_LABELS[documentType],
          id: `document-traveler-${traveler.id}-${documentType}`,
          relatedTo: traveler.full_name || "Viajero sin nombre"
        })
      );
    }

    if (traveler.requires_mexico_entry_review) {
      rows.push({
        actionLabel: "Proximamente",
        actionType: "review_requirement",
        area: "Requisito Mexico",
        detail: traveler.mexico_entry_status,
        id: `mexico-review-${traveler.id}`,
        mainData: "Revision documental Mexico",
        personOrRelation: traveler.full_name || "Viajero sin nombre",
        priority: "Media",
        relatedId: traveler.id,
        responsible: "Interno",
        status: getMexicoRequirementStatus(application, traveler.id)
      });

      for (const documentType of MEXICO_REVIEW_DOCUMENT_TYPES) {
        rows.push(
          makeDocumentRow({
            area: "Requisito Mexico",
            document: findDocument(application, {
              documentType,
              isMexico: true,
              travelerId: traveler.id
            }),
            documentLabel: MEXICO_REVIEW_DOCUMENT_LABELS[documentType],
            id: `document-mexico-${traveler.id}-${documentType}`,
            relatedTo: traveler.full_name || "Viajero sin nombre"
          })
        );
      }
    }
  }

  return rows;
}
