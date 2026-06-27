import {
  DOCUMENT_STATUS_LABELS,
  GENERAL_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_TYPES,
  REQUIRED_GENERAL_DOCUMENT_TYPES,
  REQUIRED_TRAVELER_DOCUMENT_TYPES,
  TRAVELER_DOCUMENT_LABELS
} from "@/lib/constants";
import type { InternalApplicationDetail } from "@/lib/internal/queries";
import type { PaymentCommitment } from "@/lib/payments";
import type { DocumentStatus } from "@/types/database";

export type UnifiedRowStatus =
  | "Aceptado"
  | "Autorizado"
  | "Cargado"
  | "Completo"
  | "En revision"
  | "No aplica"
  | "Pendiente"
  | "Pagado"
  | "Parcial"
  | "Rechazado"
  | "Reemplazo solicitado"
  | "Requiere accion"
  | "Solicitado"
  | "Vencido"
  | "Cancelado"
  | "Condicionado"
  | "Acuerdo especial";

export type UnifiedRowPriority = "Alta" | "Media" | "Baja";

export type UnifiedRowActionType =
  | "approve_date"
  | "none"
  | "view_payment"
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
  detail: string;
  document?: ApplicationUnifiedDocument;
  documentId?: string;
  id: string;
  identifier: string;
  mainData: string;
  nameOrReference: string;
  priority: UnifiedRowPriority;
  relatedId?: string;
  responsible: "Cliente" | "Interno" | "Sistema";
  status: UnifiedRowStatus;
  type: string;
};

type TravelerDetail = InternalApplicationDetail["travelers"][number];

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

function getTravelerBaseIdentifier(index: number) {
  return `V-${String(index + 1).padStart(2, "0")}`;
}

function getTravelerDisplayIdentifier(index: number, traveler: TravelerDetail) {
  const baseIdentifier = getTravelerBaseIdentifier(index);

  return traveler.is_main_client ? `${baseIdentifier} - Principal` : baseIdentifier;
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

  if (status === "accepted") {
    return "Sistema" as const;
  }

  return "Cliente" as const;
}

function getDocumentActionLabel(status: DocumentStatus, hasFile: boolean) {
  if (!hasFile) {
    return "Solicitar";
  }

  if (status === "rejected" || status === "replacement_requested") {
    return "Ver comentario";
  }

  return "Ver archivo";
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
  document,
  documentLabel,
  id,
  identifier,
  nameOrReference,
  type
}: {
  document: InternalApplicationDetail["documents"][number] | null;
  documentLabel: string;
  id: string;
  identifier: string;
  nameOrReference: string;
  type: "Documento" | "Documento general" | "Requisito Mexico";
}): ApplicationUnifiedRow {
  if (!document) {
    return {
      actionLabel: "Solicitar",
      actionType: "upcoming",
      detail: "Pendiente de carga",
      id,
      identifier,
      mainData: documentLabel,
      nameOrReference,
      priority: "Media",
      responsible: "Cliente",
      status: "Pendiente",
      type
    };
  }

  const hasFile = Boolean(document.file_name);

  return {
    actionLabel: getDocumentActionLabel(document.status, hasFile),
    actionType: hasFile ? "view_document" : "upcoming",
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
      relatedTo: nameOrReference,
      status: document.status
    },
    documentId: document.id,
    id,
    identifier,
    mainData: documentLabel,
    nameOrReference,
    priority: getDocumentPriority(document.status),
    relatedId: document.id,
    responsible: getDocumentResponsible(document.status),
    status: getDocumentStatus(document.status),
    type
  };
}

function getTravelerStatus(traveler: TravelerDetail): UnifiedRowStatus {
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

function buildTravelerIdentifierMap(travelers: TravelerDetail[]) {
  return new Map(
    travelers.map((traveler, index) => [
      traveler.id,
      {
        base: getTravelerBaseIdentifier(index),
        display: getTravelerDisplayIdentifier(index, traveler)
      }
    ])
  );
}

function shouldShowDateRow(application: InternalApplicationDetail) {
  return (
    application.requested_date_status === "none" ||
    application.requested_date_status === "requested" ||
    application.requested_date_status === "rejected" ||
    Boolean(
      application.requested_date &&
        application.requested_date.capacity_available < application.total_people
    )
  );
}

function buildDateRow(application: InternalApplicationDetail): ApplicationUnifiedRow {
  const hasInsufficientCapacity = Boolean(
    application.requested_date &&
      application.requested_date.capacity_available < application.total_people
  );

  if (hasInsufficientCapacity) {
    return {
      actionLabel: "Revisar",
      actionType: "approve_date",
      detail: `${application.requested_date?.capacity_available ?? 0} cupo(s) disponibles / ${application.total_people} requeridos`,
      id: "date-capacity",
      identifier: "SOL",
      mainData: "Cupo insuficiente",
      nameOrReference: "Grupo completo",
      priority: "Alta",
      relatedId: application.requested_date_id ?? undefined,
      responsible: "Interno",
      status: "Requiere accion",
      type: "Pendiente"
    };
  }

  if (application.requested_date_status === "requested") {
    return {
      actionLabel: "Revisar",
      actionType: "approve_date",
      detail: joinDetails([
        application.requested_date?.date,
        application.requested_date?.location_city
      ]),
      id: "date-requested",
      identifier: "SOL",
      mainData: "Fecha pendiente de autorizacion",
      nameOrReference: "Grupo completo",
      priority: "Alta",
      relatedId: application.requested_date_id ?? undefined,
      responsible: "Interno",
      status: "En revision",
      type: "Pendiente"
    };
  }

  if (application.requested_date_status === "rejected") {
    return {
      actionLabel: "Solicitar",
      actionType: "upcoming",
      detail: "Cliente debe seleccionar una nueva fecha",
      id: "date-rejected",
      identifier: "SOL",
      mainData: "Fecha rechazada",
      nameOrReference: "Grupo completo",
      priority: "Alta",
      relatedId: application.requested_date_id ?? undefined,
      responsible: "Cliente",
      status: "Rechazado",
      type: "Pendiente"
    };
  }

  return {
    actionLabel: "Solicitar",
    actionType: "upcoming",
    detail: "Se requiere solicitar una fecha disponible",
    id: "date-missing",
    identifier: "SOL",
    mainData: "Falta solicitar fecha",
    nameOrReference: "Grupo completo",
    priority: "Media",
    responsible: "Cliente",
    status: "Pendiente",
    type: "Pendiente"
  };
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    currency,
    style: "currency"
  }).format(amount);
}

function getPaymentStatus(payment: PaymentCommitment): UnifiedRowStatus {
  const statusMap: Record<PaymentCommitment["status"], UnifiedRowStatus> = {
    cancelled: "Cancelado",
    conditioned: "Condicionado",
    in_review: "En revision",
    overdue: "Vencido",
    paid: "Pagado",
    partial: "Parcial",
    pending: "Pendiente",
    rejected: "Rechazado",
    requested: "Solicitado",
    special_agreement: "Acuerdo especial"
  };

  return statusMap[payment.status];
}

function getPaymentPriority(payment: PaymentCommitment): UnifiedRowPriority {
  if (payment.blocks_progress && payment.status !== "paid") {
    return "Alta";
  }

  if (payment.status === "pending" || payment.status === "requested" || payment.status === "overdue") {
    return "Media";
  }

  return "Baja";
}

function appendPaymentRows(rows: ApplicationUnifiedRow[], payments: PaymentCommitment[]) {
  payments.forEach((payment, index) => {
    rows.push({
      actionLabel: payment.latest_receipt ? "Revisar" : "Ver pago",
      actionType: "view_payment",
      detail: [
        payment.due_date ? `Vence: ${payment.due_date}` : "Sin fecha limite",
        payment.blocks_progress ? "Bloquea avance" : "No bloquea avance",
        payment.latest_receipt?.file_name ? `Comprobante: ${payment.latest_receipt.file_name}` : null
      ]
        .filter(Boolean)
        .join(" / "),
      id: `payment-${payment.id}`,
      identifier: `PAY-${String(index + 1).padStart(2, "0")}`,
      mainData: formatMoney(payment.amount, payment.currency),
      nameOrReference: payment.traveler?.full_name ?? payment.concept,
      priority: getPaymentPriority(payment),
      relatedId: payment.id,
      responsible: payment.status === "paid" ? "Sistema" : "Cliente",
      status: getPaymentStatus(payment),
      type: "Pago"
    });
  });
}

export function buildApplicationUnifiedRows(
  application: InternalApplicationDetail,
  payments: PaymentCommitment[] = []
): ApplicationUnifiedRow[] {
  const travelerIdentifiers = buildTravelerIdentifierMap(application.travelers);
  const rows: ApplicationUnifiedRow[] = [];

  application.travelers.forEach((traveler, index) => {
    const status = getTravelerStatus(traveler);
    const identifier = travelerIdentifiers.get(traveler.id)?.display ?? getTravelerDisplayIdentifier(index, traveler);

    rows.push({
      actionLabel: "Ver",
      actionType: "none",
      detail: joinDetails([
        traveler.age ? `Edad: ${traveler.age}` : null,
        traveler.whatsapp_e164 ? `WhatsApp: ${traveler.whatsapp_e164}` : "Sin WhatsApp propio",
        status === "Completo" ? "Sin pendientes" : "Datos por revisar"
      ]),
      id: `traveler-${traveler.id}`,
      identifier,
      mainData: traveler.nationality ? `Nacionalidad: ${traveler.nationality}` : "Nacionalidad pendiente",
      nameOrReference: traveler.full_name || "Viajero sin nombre",
      priority: status === "Completo" ? "Baja" : "Media",
      relatedId: traveler.id,
      responsible: "Cliente",
      status,
      type: "Viajero"
    });
  });

  for (let index = application.travelers.length; index < application.total_people; index += 1) {
    rows.push({
      actionLabel: "Solicitar",
      actionType: "upcoming",
      detail: "Se requiere registrar esta persona para continuar el seguimiento.",
      id: `traveler-missing-${index + 1}`,
      identifier: getTravelerBaseIdentifier(index),
      mainData: "Falta persona que viaja",
      nameOrReference: "Pendiente",
      priority: "Alta",
      responsible: "Cliente",
      status: "Pendiente",
      type: "Viajero"
    });
  }

  if (application.receiving_contact) {
    rows.push({
      actionLabel: "Ver",
      actionType: "none",
      detail: joinDetails([
        application.receiving_contact.whatsapp_e164
          ? `WhatsApp: ${application.receiving_contact.whatsapp_e164}`
          : "Sin WhatsApp",
        application.receiving_contact.relationship,
        application.receiving_contact.address_reference
      ]),
      id: `receiving-contact-${application.receiving_contact.id}`,
      identifier: "CR-01",
      mainData: joinDetails([
        application.receiving_contact.city_other ?? application.receiving_contact.city_name,
        application.receiving_contact.state_name
      ]),
      nameOrReference: application.receiving_contact.full_name,
      priority: hasValue(application.receiving_contact.whatsapp_e164) ? "Baja" : "Media",
      relatedId: application.receiving_contact.id,
      responsible: "Cliente",
      status:
        hasValue(application.receiving_contact.full_name) &&
        hasValue(application.receiving_contact.whatsapp_e164) &&
        hasValue(application.receiving_contact.address_reference)
          ? "Completo"
          : "Requiere accion",
      type: "Contacto que recibe"
    });
  } else {
    rows.push({
      actionLabel: "Solicitar",
      actionType: "upcoming",
      detail: "Se requiere registrar persona que recibe en destino",
      id: "receiving-contact-missing",
      identifier: "CR-01",
      mainData: "Falta contacto que recibe",
      nameOrReference: "Pendiente",
      priority: "Alta",
      responsible: "Cliente",
      status: "Pendiente",
      type: "Contacto que recibe"
    });
  }

  if (shouldShowDateRow(application)) {
    rows.push(buildDateRow(application));
  }

  for (const documentType of REQUIRED_GENERAL_DOCUMENT_TYPES) {
    rows.push(
      makeDocumentRow({
        document: findDocument(application, { documentType }),
        documentLabel: GENERAL_DOCUMENT_LABELS[documentType],
        id: `document-general-${documentType}`,
        identifier: "SOL",
        nameOrReference: "Solicitud",
        type: "Documento general"
      })
    );
  }

  for (const traveler of application.travelers) {
    const identifier = travelerIdentifiers.get(traveler.id)?.base ?? "V-00";
    const nameOrReference = traveler.full_name || "Viajero sin nombre";

    for (const documentType of REQUIRED_TRAVELER_DOCUMENT_TYPES) {
      rows.push(
        makeDocumentRow({
          document: findDocument(application, {
            documentType,
            travelerId: traveler.id
          }),
          documentLabel: TRAVELER_DOCUMENT_LABELS[documentType],
          id: `document-traveler-${traveler.id}-${documentType}`,
          identifier,
          nameOrReference,
          type: "Documento"
        })
      );
    }

    if (traveler.requires_mexico_entry_review) {
      rows.push({
        actionLabel: "Revisar",
        actionType: "review_requirement",
        detail: "Requiere validar documentacion previa",
        id: `mexico-review-${traveler.id}`,
        identifier,
        mainData: "Revision documental Mexico",
        nameOrReference,
        priority: "Media",
        relatedId: traveler.id,
        responsible: "Interno",
        status: getMexicoRequirementStatus(application, traveler.id),
        type: "Requisito Mexico"
      });

      for (const documentType of MEXICO_REVIEW_DOCUMENT_TYPES) {
        rows.push(
          makeDocumentRow({
            document: findDocument(application, {
              documentType,
              isMexico: true,
              travelerId: traveler.id
            }),
            documentLabel: MEXICO_REVIEW_DOCUMENT_LABELS[documentType],
            id: `document-mexico-${traveler.id}-${documentType}`,
            identifier,
            nameOrReference,
            type: "Requisito Mexico"
          })
        );
      }
    }
  }

  appendPaymentRows(rows, payments);

  return rows;
}
