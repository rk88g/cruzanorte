import {
  GENERAL_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_TYPES,
  REQUIRED_GENERAL_DOCUMENT_TYPES,
  REQUIRED_TRAVELER_DOCUMENT_TYPES,
  TRAVELER_DOCUMENT_LABELS
} from "@/lib/constants";
import {
  getInternalDateDetailRoute,
  getInternalDocumentDetailRoute
} from "@/lib/internal/routes";
import type { InternalApplicationDetail } from "@/lib/internal/queries";

export type BreakdownStatus =
  | "Autorizado"
  | "Completo"
  | "En revision"
  | "No aplica"
  | "Pendiente"
  | "Proximamente"
  | "Rechazado"
  | "Requiere accion";

export type PendingPriority = "Alta" | "Media" | "Baja";
export type PendingResponsible = "Cliente" | "Interno" | "Sistema";

export type ApplicationBreakdownItem = {
  area: string;
  status: BreakdownStatus;
  summary: string;
};

export type ApplicationPendingItem = {
  actionHref?: string;
  actionLabel: string;
  area: string;
  pending: string;
  priority: PendingPriority;
  relatedTo: string;
  responsible: PendingResponsible;
  status: BreakdownStatus;
};

function hasValue(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value > 0;
  }

  return Boolean(value?.trim());
}

function getDateSummary(application: InternalApplicationDetail) {
  if (application.requested_date_status === "approved" || application.approved_date_id) {
    return {
      status: "Autorizado" as BreakdownStatus,
      summary: application.approved_date
        ? `Fecha autorizada: ${application.approved_date.date}`
        : "Fecha autorizada"
    };
  }

  if (application.requested_date_status === "requested" && application.requested_date) {
    return {
      status: "En revision" as BreakdownStatus,
      summary: "Fecha solicitada pendiente de autorizacion"
    };
  }

  if (application.requested_date_status === "rejected") {
    return {
      status: "Rechazado" as BreakdownStatus,
      summary: "La fecha solicitada no fue autorizada"
    };
  }

  return {
    status: "Pendiente" as BreakdownStatus,
    summary: "Falta solicitar fecha"
  };
}

function getDocumentSummary(application: InternalApplicationDetail) {
  const summary = application.document_summary;

  if (summary.rejected_count > 0 || summary.replacement_requested_count > 0) {
    return {
      status: "Requiere accion" as BreakdownStatus,
      summary: `${summary.rejected_count + summary.replacement_requested_count} documento(s) requieren atencion`
    };
  }

  if (
    summary.required_total > 0 &&
    summary.accepted_count >= summary.required_total &&
    summary.pending_count === 0
  ) {
    return {
      status: "Completo" as BreakdownStatus,
      summary: "Documentacion aceptada"
    };
  }

  if (summary.in_review_count > 0 || summary.uploaded_count > 0) {
    return {
      status: "En revision" as BreakdownStatus,
      summary: `${summary.uploaded_count} documento(s) cargados`
    };
  }

  return {
    status: "Pendiente" as BreakdownStatus,
    summary: `${summary.pending_count} documento(s) faltantes`
  };
}

function getTravelerImportantMissingFields(
  traveler: InternalApplicationDetail["travelers"][number]
) {
  const missing: string[] = [];

  if (!hasValue(traveler.full_name)) {
    missing.push("nombre");
  }

  if (!hasValue(traveler.birth_date)) {
    missing.push("fecha de nacimiento");
  }

  if (!hasValue(traveler.nationality)) {
    missing.push("nacionalidad");
  }

  if (!hasValue(traveler.relationship)) {
    missing.push("parentesco");
  }

  return missing;
}

function getReceivingContactMissingFields(application: InternalApplicationDetail) {
  const contact = application.receiving_contact;

  if (!contact) {
    return ["contacto que recibe"];
  }

  const missing: string[] = [];

  if (!hasValue(contact.full_name)) {
    missing.push("nombre");
  }

  if (!hasValue(contact.relationship)) {
    missing.push("relacion");
  }

  if (!hasValue(contact.whatsapp_e164)) {
    missing.push("whatsapp_e164");
  }

  if (!hasValue(contact.state_name)) {
    missing.push("estado USA");
  }

  if (!hasValue(contact.city_name) && !hasValue(contact.city_other)) {
    missing.push("ciudad USA");
  }

  if (!hasValue(contact.address_reference)) {
    missing.push("direccion aproximada");
  }

  return missing;
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

function getDocumentPendingItem(
  document: InternalApplicationDetail["documents"][number] | null,
  {
    area,
    documentLabel,
    relatedTo
  }: {
    area: string;
    documentLabel: string;
    relatedTo: string;
  }
): ApplicationPendingItem | null {
  if (!document) {
    return {
      priority: "Alta",
      area,
      pending: `Falta ${documentLabel}`,
      relatedTo,
      status: "Pendiente",
      responsible: "Cliente",
      actionLabel: "Esperar cliente"
    };
  }

  const status = document.status;

  if (status === "accepted") {
    return null;
  }

  if (status === "uploaded" || status === "in_review") {
    return {
      priority: "Media",
      area,
      pending: `Revisar ${documentLabel}`,
      relatedTo,
      status: "En revision",
      responsible: "Interno",
      actionLabel: "Ver documento",
      actionHref: getInternalDocumentDetailRoute(document.id)
    };
  }

  if (status === "rejected" || status === "replacement_requested") {
    return {
      priority: "Alta",
      area,
      pending:
        status === "rejected"
          ? `${documentLabel} rechazado`
          : `${documentLabel}: reemplazo solicitado`,
      relatedTo,
      status: "Requiere accion",
      responsible: "Cliente",
      actionLabel: "Ver documento",
      actionHref: getInternalDocumentDetailRoute(document.id)
    };
  }

  return null;
}

function getMexicoReviewStatus(application: InternalApplicationDetail) {
  const travelersWithReview = application.travelers.filter(
    (traveler) => traveler.requires_mexico_entry_review
  );

  if (travelersWithReview.length === 0) {
    return {
      status: "No aplica" as BreakdownStatus,
      summary: "Ningun viajero requiere revision documental de Mexico"
    };
  }

  const mexicoDocuments = application.documents.filter((document) =>
    Boolean(document.mexico_requirement_id)
  );
  const acceptedCount = mexicoDocuments.filter((document) => document.status === "accepted").length;
  const requiredCount = travelersWithReview.length * MEXICO_REVIEW_DOCUMENT_TYPES.length;

  if (requiredCount > 0 && acceptedCount >= requiredCount) {
    return {
      status: "Completo" as BreakdownStatus,
      summary: "Revision documental de Mexico completa"
    };
  }

  if (
    mexicoDocuments.some((document) =>
      ["uploaded", "in_review"].includes(document.status)
    )
  ) {
    return {
      status: "En revision" as BreakdownStatus,
      summary: `${travelersWithReview.length} viajero(s) requieren seguimiento`
    };
  }

  return {
    status: "Pendiente" as BreakdownStatus,
    summary: `${travelersWithReview.length} viajero(s) requieren revision`
  };
}

export function buildApplicationGeneralBreakdown(
  application: InternalApplicationDetail
): ApplicationBreakdownItem[] {
  const registrationMissing = [
    application.main_contact_name,
    application.origin_country,
    application.origin_city,
    application.process_reason,
    application.total_people
  ].filter((value) => !hasValue(value)).length;
  const missingTravelers = Math.max(application.total_people - application.travelers.length, 0);
  const travelersWithMissingFields = application.travelers.filter(
    (traveler) => getTravelerImportantMissingFields(traveler).length > 0
  );
  const contactMissing = getReceivingContactMissingFields(application);
  const dateSummary = getDateSummary(application);
  const documentSummary = getDocumentSummary(application);
  const mexicoSummary = getMexicoReviewStatus(application);

  return [
    {
      area: "Registro inicial",
      status: registrationMissing === 0 ? "Completo" : "Requiere accion",
      summary:
        registrationMissing === 0
          ? "Informacion principal capturada"
          : `${registrationMissing} dato(s) principales faltantes`
    },
    {
      area: "Personas que viajan",
      status:
        missingTravelers === 0 && travelersWithMissingFields.length === 0
          ? "Completo"
          : "Requiere accion",
      summary:
        missingTravelers === 0
          ? `${application.travelers.length} de ${application.total_people} personas agregadas`
          : `Faltan ${missingTravelers} persona(s) por agregar`
    },
    {
      area: "Contacto que recibe",
      status: contactMissing.length === 0 ? "Completo" : "Pendiente",
      summary:
        contactMissing.length === 0
          ? "Contacto registrado"
          : `Falta ${contactMissing.join(", ")}`
    },
    {
      area: "Fecha",
      status: dateSummary.status,
      summary: dateSummary.summary
    },
    {
      area: "Documentacion",
      status: documentSummary.status,
      summary: documentSummary.summary
    },
    {
      area: "Requisitos Mexico",
      status: mexicoSummary.status,
      summary: mexicoSummary.summary
    },
    {
      area: "Pagos",
      status: "Proximamente",
      summary: "Modulo aun no implementado"
    }
  ];
}

export function buildApplicationPendingItems(
  application: InternalApplicationDetail
): ApplicationPendingItem[] {
  const items: ApplicationPendingItem[] = [];
  const registrationFields = [
    { label: "nombre del cliente principal", value: application.main_contact_name },
    { label: "pais de origen", value: application.origin_country },
    { label: "ciudad de origen", value: application.origin_city },
    { label: "motivo del proceso", value: application.process_reason },
    { label: "total de personas", value: application.total_people }
  ];

  for (const field of registrationFields) {
    if (!hasValue(field.value)) {
      items.push({
        priority: "Alta",
        area: "Registro inicial",
        pending: `Falta ${field.label}`,
        relatedTo: "Solicitud",
        status: "Requiere accion",
        responsible: "Cliente",
        actionLabel: "Solicitar correccion"
      });
    }
  }

  const missingTravelers = Math.max(application.total_people - application.travelers.length, 0);

  if (missingTravelers > 0) {
    items.push({
      priority: "Alta",
      area: "Personas que viajan",
      pending: `Faltan ${missingTravelers} persona(s) por agregar`,
      relatedTo: "Grupo completo",
      status: "Pendiente",
      responsible: "Cliente",
      actionLabel: "Esperar cliente"
    });
  }

  for (const traveler of application.travelers) {
    const missingFields = getTravelerImportantMissingFields(traveler);

    if (missingFields.length > 0) {
      items.push({
        priority: "Media",
        area: "Personas que viajan",
        pending: `Faltan datos: ${missingFields.join(", ")}`,
        relatedTo: traveler.full_name || "Viajero sin nombre",
        status: "Requiere accion",
        responsible: "Cliente",
        actionLabel: "Solicitar correccion"
      });
    }
  }

  const contactMissing = getReceivingContactMissingFields(application);

  if (!application.receiving_contact) {
    items.push({
      priority: "Alta",
      area: "Contacto que recibe",
      pending: "Falta contacto que recibe",
      relatedTo: "Destino",
      status: "Pendiente",
      responsible: "Cliente",
      actionLabel: "Esperar cliente"
    });
  } else {
    for (const field of contactMissing) {
      items.push({
        priority: field === "direccion aproximada" ? "Media" : "Alta",
        area: "Contacto que recibe",
        pending: `Falta ${field}`,
        relatedTo: "Contacto que recibe",
        status: "Requiere accion",
        responsible: "Cliente",
        actionLabel: "Solicitar correccion"
      });
    }
  }

  if (!application.requested_date_id && !application.approved_date_id) {
    items.push({
      priority: "Alta",
      area: "Fecha",
      pending: "Falta solicitar fecha",
      relatedTo: "Grupo completo",
      status: "Pendiente",
      responsible: "Cliente",
      actionLabel: "Esperar cliente"
    });
  }

  if (
    application.requested_date_status === "requested" &&
    application.requested_date_id &&
    !application.approved_date_id
  ) {
    items.push({
      priority: "Alta",
      area: "Fecha",
      pending: "Fecha pendiente de autorizacion",
      relatedTo: application.requested_date?.location_city ?? "Fecha solicitada",
      status: "En revision",
      responsible: "Interno",
      actionLabel: "Revisar fecha",
      actionHref: "#fecha"
    });

    if (
      application.requested_date &&
      application.requested_date.capacity_available < application.total_people
    ) {
      items.push({
        priority: "Alta",
        area: "Fecha",
        pending: "Revisar cupo disponible",
        relatedTo: `${application.requested_date.capacity_available} cupo(s) disponibles`,
        status: "Requiere accion",
        responsible: "Interno",
        actionLabel: "Revisar fecha",
        actionHref: getInternalDateDetailRoute(application.requested_date.id)
      });
    }
  }

  if (application.requested_date_status === "rejected") {
    items.push({
      priority: "Alta",
      area: "Fecha",
      pending: "Fecha rechazada; cliente debe seleccionar otra",
      relatedTo: "Fecha solicitada",
      status: "Rechazado",
      responsible: "Cliente",
      actionLabel: "Esperar cliente"
    });
  }

  for (const documentType of REQUIRED_GENERAL_DOCUMENT_TYPES) {
    const document = findDocument(application, { documentType });
    const pendingItem = getDocumentPendingItem(document, {
      area: "Documentacion",
      documentLabel: GENERAL_DOCUMENT_LABELS[documentType],
      relatedTo: "Solicitud"
    });

    if (pendingItem) {
      items.push(pendingItem);
    }
  }

  for (const traveler of application.travelers) {
    for (const documentType of REQUIRED_TRAVELER_DOCUMENT_TYPES) {
      const document = findDocument(application, {
        documentType,
        travelerId: traveler.id
      });
      const pendingItem = getDocumentPendingItem(document, {
        area: "Documentacion",
        documentLabel: TRAVELER_DOCUMENT_LABELS[documentType],
        relatedTo: traveler.full_name || "Viajero sin nombre"
      });

      if (pendingItem) {
        items.push(pendingItem);
      }
    }
  }

  for (const traveler of application.travelers.filter(
    (item) => item.requires_mexico_entry_review
  )) {
    const mexicoDocuments = MEXICO_REVIEW_DOCUMENT_TYPES.map((documentType) =>
      findDocument(application, {
        documentType,
        isMexico: true,
        travelerId: traveler.id
      })
    );

    if (mexicoDocuments.length === 0 || mexicoDocuments.every((document) => !document)) {
      items.push({
        priority: "Media",
        area: "Requisitos Mexico",
        pending: "Revision de requisitos de entrada a Mexico",
        relatedTo: traveler.full_name || "Viajero sin nombre",
        status: "Pendiente",
        responsible: "Interno",
        actionLabel: "Revisar requisito"
      });
      continue;
    }

    MEXICO_REVIEW_DOCUMENT_TYPES.forEach((documentType, index) => {
      const pendingItem = getDocumentPendingItem(mexicoDocuments[index], {
        area: "Requisitos Mexico",
        documentLabel: MEXICO_REVIEW_DOCUMENT_LABELS[documentType],
        relatedTo: traveler.full_name || "Viajero sin nombre"
      });

      if (pendingItem) {
        items.push({
          ...pendingItem,
          priority: pendingItem.priority === "Alta" ? "Alta" : "Media"
        });
      }
    });
  }

  return items.sort((a, b) => {
    const priorityOrder: Record<PendingPriority, number> = {
      Alta: 0,
      Media: 1,
      Baja: 2
    };

    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
