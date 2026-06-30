import {
  APPLICATION_STAGES,
  DOCUMENT_STATUS_LABELS,
  GENERAL_DOCUMENT_LABELS,
  MEXICO_REVIEW_DOCUMENT_LABELS,
  PAYMENT_STATUS_LABELS,
  REQUESTED_DATE_STATUS_LABELS,
  TRAVELER_DOCUMENT_LABELS
} from "@/lib/constants";
import {
  buildApplicationStageChecklist,
  type ApplicationStageChecklistItem,
  type ApplicationUnifiedDocument
} from "@/lib/internal/applicationDetail";
import type { InternalApplicationDetail } from "@/lib/internal/queries";
import type { PaymentCommitment } from "@/lib/payments";
import { shouldShowAutomaticDocumentRequirements } from "@/lib/stages";
import type { DocumentStatus, MexicoEntryStatus, MexicoRequirementStatus } from "@/types/database";

export type ApplicationCardGroupKey =
  | "documents"
  | "mexicoRequirements"
  | "payments"
  | "receivingContact"
  | "stage"
  | "travelers";

export type ApplicationCardFilter =
  | "all"
  | "client"
  | "documents"
  | "internal"
  | "payments"
  | "pending"
  | "stage";

export type ApplicationCardActionType =
  | "none"
  | "upcoming"
  | "view_detail"
  | "view_document"
  | "view_payment"
  | "view_receipt";

export type ApplicationCardPriority = "Alta" | "Media" | "Baja";
export type ApplicationCardResponsible = "Cliente" | "Interno" | "Sistema";

export type ApplicationCardDetail = {
  label: string;
  value: string;
};

export type ApplicationCardItem = {
  actionLabel: string;
  actionType: ApplicationCardActionType;
  detailTitle?: string;
  document?: ApplicationUnifiedDocument;
  documentId?: string;
  group: ApplicationCardGroupKey;
  id: string;
  identifier: string;
  payment?: PaymentCommitment;
  paymentId?: string;
  primaryDetail: string;
  priority: ApplicationCardPriority;
  relatedId?: string;
  responsible: ApplicationCardResponsible;
  secondaryDetails: ApplicationCardDetail[];
  status: string;
  subtitle: string;
  title: string;
};

export type ApplicationCardGroup = {
  countLabel: string;
  id: ApplicationCardGroupKey;
  items: ApplicationCardItem[];
  summary: string;
  title: string;
};

export type ApplicationCriticalAlert = {
  detail: string;
  id: string;
  priority: ApplicationCardPriority;
  title: string;
};

export type ApplicationSummaryStripItem = {
  label: string;
  status: string;
  value: string;
};

export type ApplicationCardsBoardData = {
  alerts: ApplicationCriticalAlert[];
  filters: {
    id: ApplicationCardFilter;
    label: string;
  }[];
  groups: ApplicationCardGroup[];
  summary: ApplicationSummaryStripItem[];
};

const mexicoEntryStatusLabels: Record<MexicoEntryStatus, string> = {
  approved: "Revisado",
  in_review: "En revision",
  needs_more_information: "Requiere informacion",
  not_required: "No requerida",
  not_reviewed: "No revisada",
  rejected: "Requiere atencion",
  required: "Pendiente"
};

const mexicoRequirementStatusLabels: Record<MexicoRequirementStatus, string> = {
  accepted: "Aceptado",
  in_review: "En revision",
  not_required: "No requerido",
  pending: "Pendiente",
  rejected: "Rechazado",
  replacement_requested: "Reemplazo solicitado",
  requested: "Solicitado",
  uploaded: "Cargado"
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", {
    currency,
    style: "currency"
  }).format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function getStageLabel(stageSlug: string | null | undefined) {
  return APPLICATION_STAGES.find((stage) => stage.slug === stageSlug)?.label ?? "Sin etapa";
}

function getStageIdentifier(stageSlug: string) {
  const index = APPLICATION_STAGES.findIndex((stage) => stage.slug === stageSlug);

  return `STG-${String(Math.max(index + 1, 1)).padStart(2, "0")}`;
}

function getTravelerIdentifier(index: number, isMainClient: boolean) {
  const identifier = `V-${String(index + 1).padStart(2, "0")}`;

  return isMainClient ? `${identifier} · Principal` : identifier;
}

function getTravelerBaseIdentifier(index: number) {
  return `V-${String(index + 1).padStart(2, "0")}`;
}

function getDocumentLabel(documentType: string) {
  if (documentType in GENERAL_DOCUMENT_LABELS) {
    return GENERAL_DOCUMENT_LABELS[documentType as keyof typeof GENERAL_DOCUMENT_LABELS];
  }

  if (documentType in TRAVELER_DOCUMENT_LABELS) {
    return TRAVELER_DOCUMENT_LABELS[documentType as keyof typeof TRAVELER_DOCUMENT_LABELS];
  }

  if (documentType in MEXICO_REVIEW_DOCUMENT_LABELS) {
    return MEXICO_REVIEW_DOCUMENT_LABELS[
      documentType as keyof typeof MEXICO_REVIEW_DOCUMENT_LABELS
    ];
  }

  return documentType;
}

function getDocumentPriority(status: DocumentStatus): ApplicationCardPriority {
  if (status === "rejected" || status === "replacement_requested") {
    return "Alta";
  }

  if (status === "pending" || status === "uploaded" || status === "in_review") {
    return "Media";
  }

  return "Baja";
}

function getDocumentResponsible(status: DocumentStatus): ApplicationCardResponsible {
  if (status === "uploaded" || status === "in_review") {
    return "Interno";
  }

  if (status === "accepted") {
    return "Sistema";
  }

  return "Cliente";
}

function getPaymentPriority(payment: PaymentCommitment): ApplicationCardPriority {
  if (payment.blocks_progress && payment.status !== "paid") {
    return "Alta";
  }

  if (payment.status === "pending" || payment.status === "requested" || payment.status === "overdue") {
    return "Media";
  }

  return "Baja";
}

function isCardPending(card: ApplicationCardItem) {
  return (
    card.priority === "Alta" ||
    ["Pendiente", "Rechazado", "Reemplazo solicitado", "Solicitado", "Vencido"].includes(
      card.status
    )
  );
}

function makeGroup({
  id,
  items,
  summary,
  title
}: {
  id: ApplicationCardGroupKey;
  items: ApplicationCardItem[];
  summary: string;
  title: string;
}): ApplicationCardGroup {
  return {
    countLabel: `${items.length} ${items.length === 1 ? "elemento" : "elementos"}`,
    id,
    items,
    summary,
    title
  };
}

function buildTravelerCards(application: InternalApplicationDetail): ApplicationCardItem[] {
  return application.travelers.map((traveler, index) => {
    const identifier = getTravelerIdentifier(index, traveler.is_main_client);
    const isComplete = Boolean(traveler.full_name && traveler.nationality && traveler.relationship);

    return {
      actionLabel: "Ver detalle",
      actionType: "view_detail",
      detailTitle: identifier,
      group: "travelers",
      id: `traveler-${traveler.id}`,
      identifier,
      primaryDetail: traveler.whatsapp_e164
        ? `WhatsApp: ${traveler.whatsapp_e164}`
        : "Sin WhatsApp registrado",
      priority: isComplete ? "Baja" : "Media",
      relatedId: traveler.id,
      responsible: "Cliente",
      secondaryDetails: [
        { label: "Parentesco", value: traveler.relationship ?? "Sin dato" },
        { label: "Edad", value: traveler.age ? String(traveler.age) : "Sin dato" },
        { label: "Nacionalidad", value: traveler.nationality ?? "Sin dato" },
        { label: "Pais de origen", value: traveler.country_origin ?? "Sin dato" },
        {
          label: "Revision Mexico",
          value: traveler.requires_mexico_entry_review
            ? mexicoEntryStatusLabels[traveler.mexico_entry_status]
            : "No requerida"
        }
      ],
      status: isComplete ? "Completo" : "Requiere atencion",
      subtitle: [
        traveler.nationality ? `Nacionalidad: ${traveler.nationality}` : null,
        traveler.age ? `Edad: ${traveler.age}` : null
      ]
        .filter(Boolean)
        .join(" · ") || "Datos principales",
      title: traveler.full_name || "Persona sin nombre"
    };
  });
}

function buildReceivingContactCards(application: InternalApplicationDetail): ApplicationCardItem[] {
  const contact = application.receiving_contact;

  if (!contact) {
    return [
      {
        actionLabel: "Proximamente",
        actionType: "upcoming",
        group: "receivingContact",
        id: "receiving-contact-missing",
        identifier: "CR-01",
        primaryDetail: "No hay contacto registrado.",
        priority: "Alta",
        responsible: "Cliente",
        secondaryDetails: [],
        status: "Requiere atencion",
        subtitle: "Contacto que recibe",
        title: "Contacto pendiente"
      }
    ];
  }

  const isComplete = Boolean(contact.full_name && contact.whatsapp_e164 && contact.address_reference);

  return [
    {
      actionLabel: "Ver detalle",
      actionType: "view_detail",
      detailTitle: "CR-01",
      group: "receivingContact",
      id: `receiving-contact-${contact.id}`,
      identifier: "CR-01",
      primaryDetail: contact.whatsapp_e164
        ? `WhatsApp: ${contact.whatsapp_e164}`
        : "Sin WhatsApp registrado",
      priority: isComplete ? "Baja" : "Media",
      relatedId: contact.id,
      responsible: "Cliente",
      secondaryDetails: [
        { label: "Relacion", value: contact.relationship ?? "Sin dato" },
        { label: "Estado USA", value: contact.state_name ?? "Sin dato" },
        { label: "Ciudad USA", value: contact.city_other ?? contact.city_name ?? "Sin dato" },
        { label: "Direccion aproximada", value: contact.address_reference ?? "Sin dato" },
        { label: "Notas", value: contact.notes ?? "Sin notas" }
      ],
      status: isComplete ? "Completo" : "Requiere atencion",
      subtitle: [
        contact.relationship,
        contact.city_other ?? contact.city_name,
        contact.state_name
      ]
        .filter(Boolean)
        .join(" · ") || "Destino registrado",
      title: contact.full_name
    }
  ];
}

function buildDocumentCards(application: InternalApplicationDetail): ApplicationCardItem[] {
  const travelerIdentifiers = new Map(
    application.travelers.map((traveler, index) => [
      traveler.id,
      {
        identifier: getTravelerBaseIdentifier(index),
        name: traveler.full_name || "Persona sin nombre"
      }
    ])
  );
  const includeAutomaticPending = shouldShowAutomaticDocumentRequirements(application.current_stage);

  return application.documents
    .filter((document) => includeAutomaticPending || Boolean(document.file_name))
    .map((document, index) => {
      const traveler = document.traveler_id
        ? travelerIdentifiers.get(document.traveler_id)
        : null;
      const relatedTo = traveler
        ? `${traveler.identifier} ${traveler.name}`
        : "Solicitud general";
      const documentLabel = getDocumentLabel(document.document_type);
      const identifier = document.traveler_id
        ? `DOC-${String(index + 1).padStart(2, "0")}`
        : `DOC-SOL-${String(index + 1).padStart(2, "0")}`;
      const documentPreview: ApplicationUnifiedDocument = {
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
      };

      return {
        actionLabel: document.file_name ? "Ver archivo" : "Sin accion",
        actionType: document.file_name ? "view_document" : "none",
        detailTitle: identifier,
        document: documentPreview,
        documentId: document.id,
        group: "documents",
        id: `document-${document.id}`,
        identifier,
        primaryDetail: document.file_name ?? "Sin archivo cargado",
        priority: getDocumentPriority(document.status),
        relatedId: document.id,
        responsible: getDocumentResponsible(document.status),
        secondaryDetails: [
          { label: "Relacionado con", value: relatedTo },
          { label: "Carga", value: formatDateTime(document.created_at) },
          { label: "Nota del equipo", value: document.admin_notes ?? "Sin nota" }
        ],
        status: DOCUMENT_STATUS_LABELS[document.status],
        subtitle: relatedTo,
        title: documentLabel
      } satisfies ApplicationCardItem;
    });
}

function buildPaymentCards(payments: PaymentCommitment[]): ApplicationCardItem[] {
  return payments.map((payment, index) => ({
    actionLabel: payment.latest_receipt ? "Ver comprobante" : "Ver pago",
    actionType: payment.latest_receipt ? "view_receipt" : "view_payment",
    detailTitle: `PAY-${String(index + 1).padStart(2, "0")}`,
    group: "payments",
    id: `payment-${payment.id}`,
    identifier: `PAY-${String(index + 1).padStart(2, "0")}`,
    payment,
    paymentId: payment.id,
    primaryDetail: formatMoney(payment.amount, payment.currency),
    priority: getPaymentPriority(payment),
    relatedId: payment.id,
    responsible: payment.status === "paid" ? "Sistema" : "Cliente",
    secondaryDetails: [
      { label: "Alcance", value: payment.scope_label },
      { label: "Moneda", value: payment.currency },
      { label: "Fecha limite", value: formatDate(payment.due_date) },
      { label: "Etapa relacionada", value: getStageLabel(payment.stage) },
      { label: "Bloquea avance", value: payment.blocks_progress ? "Si" : "No" },
      { label: "Comprobante", value: payment.latest_receipt?.file_name ?? "Sin comprobante" },
      { label: "Descripcion", value: payment.description ?? "Sin descripcion" }
    ],
    status: PAYMENT_STATUS_LABELS[payment.status],
    subtitle: [
      payment.status_label,
      payment.blocks_progress ? "Bloquea avance" : null
    ]
      .filter(Boolean)
      .join(" · "),
    title: payment.concept
  }));
}

function buildStageCards(
  application: InternalApplicationDetail,
  checklist: ApplicationStageChecklistItem[]
): ApplicationCardItem[] {
  const pendingItems = checklist.filter((item) => !item.completed).length;

  return [
    {
      actionLabel: "Ver detalle",
      actionType: "view_detail",
      detailTitle: getStageIdentifier(application.current_stage),
      group: "stage",
      id: `stage-${application.current_stage}`,
      identifier: getStageIdentifier(application.current_stage),
      primaryDetail: `Avance: ${application.progress}%`,
      priority: pendingItems > 0 ? "Media" : "Baja",
      responsible: "Interno",
      secondaryDetails: [
        { label: "Estado", value: pendingItems > 0 ? "En proceso" : "Completo" },
        { label: "Checklist", value: `${checklist.length - pendingItems}/${checklist.length} revisados` },
        ...checklist.map((item) => ({
          label: item.label,
          value: item.statusLabel
        }))
      ],
      status: pendingItems > 0 ? "En proceso" : "Completo",
      subtitle: "Checklist interno de seguimiento",
      title: getStageLabel(application.current_stage)
    }
  ];
}

function buildMexicoRequirementCards(application: InternalApplicationDetail): ApplicationCardItem[] {
  const travelerIdentifiers = new Map(
    application.travelers.map((traveler, index) => [
      traveler.id,
      {
        identifier: getTravelerBaseIdentifier(index),
        name: traveler.full_name || "Persona sin nombre"
      }
    ])
  );
  const requirements = application.mexico_requirements;

  if (requirements.length > 0) {
    return requirements.map((requirement, index) => {
      const traveler = travelerIdentifiers.get(requirement.traveler_id);
      const statusLabel = mexicoRequirementStatusLabels[requirement.status];

      return {
        actionLabel: "Ver detalle",
        actionType: "view_detail",
        detailTitle: `MX-${String(index + 1).padStart(2, "0")}`,
        group: "mexicoRequirements",
        id: `mexico-${requirement.id}`,
        identifier: `MX-${String(index + 1).padStart(2, "0")}`,
        primaryDetail: statusLabel,
        priority:
          requirement.status === "rejected" || requirement.status === "replacement_requested"
            ? "Alta"
            : requirement.status === "accepted" || requirement.status === "not_required"
              ? "Baja"
              : "Media",
        relatedId: requirement.id,
        responsible: "Interno",
        secondaryDetails: [
          {
            label: "Viajero relacionado",
            value: traveler ? `${traveler.identifier} ${traveler.name}` : "Sin viajero"
          },
          { label: "Tipo", value: requirement.requirement_name },
          { label: "Notas publicas", value: requirement.notes_public ?? "Sin notas" },
          { label: "Notas internas", value: requirement.notes_internal ?? "Sin notas" }
        ],
        status: statusLabel,
        subtitle: traveler ? `${traveler.identifier} ${traveler.name}` : "Viajero relacionado",
        title: requirement.requirement_name
      } satisfies ApplicationCardItem;
    });
  }

  return application.travelers
    .filter((traveler) => traveler.requires_mexico_entry_review)
    .map((traveler, index) => {
      const travelerIndex = application.travelers.findIndex((item) => item.id === traveler.id);
      const identifier = getTravelerBaseIdentifier(travelerIndex);

      return {
        actionLabel: "Revisar",
        actionType: "view_detail",
        detailTitle: `MX-${String(index + 1).padStart(2, "0")}`,
        group: "mexicoRequirements",
        id: `mexico-traveler-${traveler.id}`,
        identifier: `MX-${String(index + 1).padStart(2, "0")}`,
        primaryDetail: mexicoEntryStatusLabels[traveler.mexico_entry_status],
        priority:
          traveler.mexico_entry_status === "approved" ||
          traveler.mexico_entry_status === "not_required"
            ? "Baja"
            : "Media",
        relatedId: traveler.id,
        responsible: "Interno",
        secondaryDetails: [
          { label: "Viajero relacionado", value: `${identifier} ${traveler.full_name}` },
          { label: "Tipo", value: "Revision documental Mexico" },
          { label: "Notas", value: traveler.notes ?? "Sin notas" }
        ],
        status: mexicoEntryStatusLabels[traveler.mexico_entry_status],
        subtitle: `${identifier} ${traveler.full_name}`,
        title: "Revision documental Mexico"
      } satisfies ApplicationCardItem;
    });
}

function buildAlerts({
  application,
  cards,
  payments
}: {
  application: InternalApplicationDetail;
  cards: ApplicationCardItem[];
  payments: PaymentCommitment[];
}) {
  const alerts: ApplicationCriticalAlert[] = [];
  const rejectedDocuments = cards.filter(
    (card) =>
      card.group === "documents" &&
      (card.status === "Rechazado" || card.status === "Reemplazo solicitado")
  );
  const blockingPayments = payments.filter(
    (payment) => payment.blocks_progress && payment.status !== "paid"
  );
  const mexicoPending = cards.filter(
    (card) =>
      card.group === "mexicoRequirements" &&
      card.status !== "Aceptado" &&
      card.status !== "No requerido"
  );

  if (blockingPayments.length > 0) {
    alerts.push({
      detail: `${blockingPayments.length} compromiso(s) bloquean avance.`,
      id: "blocking-payments",
      priority: "Alta",
      title: "Pago pendiente que bloquea avance"
    });
  }

  if (rejectedDocuments.length > 0) {
    alerts.push({
      detail: `${rejectedDocuments.length} documento(s) requieren atencion o reemplazo.`,
      id: "documents-attention",
      priority: "Alta",
      title: "Documentacion con atencion pendiente"
    });
  }

  if (application.requested_date_status === "requested") {
    alerts.push({
      detail: "La fecha solicitada requiere autorizacion interna.",
      id: "date-requested",
      priority: "Media",
      title: "Fecha pendiente de autorizacion"
    });
  }

  if (mexicoPending.length > 0) {
    alerts.push({
      detail: `${mexicoPending.length} requisito(s) Mexico pendientes de revision.`,
      id: "mexico-pending",
      priority: "Media",
      title: "Requisito Mexico pendiente"
    });
  }

  if (application.travelers.length < application.total_people) {
    alerts.push({
      detail: `${application.travelers.length}/${application.total_people} personas registradas.`,
      id: "missing-travelers",
      priority: "Alta",
      title: "Informacion faltante critica"
    });
  }

  if (!application.receiving_contact) {
    alerts.push({
      detail: "No hay contacto que recibe registrado.",
      id: "missing-receiving-contact",
      priority: "Alta",
      title: "Contacto que recibe pendiente"
    });
  }

  return alerts;
}

function buildSummary({
  application,
  documentCards,
  paymentCards
}: {
  application: InternalApplicationDetail;
  documentCards: ApplicationCardItem[];
  paymentCards: ApplicationCardItem[];
}): ApplicationSummaryStripItem[] {
  const pendingDocuments = documentCards.filter((card) => card.status === "Pendiente").length;
  const loadedDocuments = documentCards.filter((card) =>
    ["Cargado", "En revision", "Aceptado"].includes(card.status)
  ).length;
  const pendingPayments = paymentCards.filter(
    (card) => card.status !== "Pagado" && card.status !== "Cancelado"
  ).length;

  return [
    {
      label: "Viajeros",
      status:
        application.travelers.length >= application.total_people ? "Completo" : "Pendiente",
      value: `${application.travelers.length}/${application.total_people}`
    },
    {
      label: "Contacto que recibe",
      status: application.receiving_contact ? "Completo" : "Pendiente",
      value: application.receiving_contact ? "Completo" : "Pendiente"
    },
    {
      label: "Fecha",
      status: REQUESTED_DATE_STATUS_LABELS[application.requested_date_status],
      value: REQUESTED_DATE_STATUS_LABELS[application.requested_date_status]
    },
    {
      label: "Documentos",
      status: pendingDocuments > 0 ? "Pendiente" : "Revisable",
      value: `${loadedDocuments} cargados / ${pendingDocuments} pendientes`
    },
    {
      label: "Pagos",
      status: pendingPayments > 0 ? "Pendiente" : "Sin pendiente",
      value: `${pendingPayments} pendientes`
    },
    {
      label: "Etapa",
      status: getStageLabel(application.current_stage),
      value: getStageLabel(application.current_stage)
    }
  ];
}

export function buildApplicationCards(
  application: InternalApplicationDetail,
  payments: PaymentCommitment[] = []
): ApplicationCardsBoardData {
  const checklist = buildApplicationStageChecklist(application, payments);
  const travelerCards = buildTravelerCards(application);
  const receivingContactCards = buildReceivingContactCards(application);
  const documentCards = buildDocumentCards(application);
  const paymentCards = buildPaymentCards(payments);
  const stageCards = buildStageCards(application, checklist);
  const mexicoRequirementCards = buildMexicoRequirementCards(application);
  const allCards = [
    ...paymentCards.filter((card) => card.priority === "Alta"),
    ...documentCards.filter((card) => card.priority === "Alta"),
    ...stageCards,
    ...travelerCards,
    ...receivingContactCards,
    ...documentCards.filter((card) => card.priority !== "Alta"),
    ...paymentCards.filter((card) => card.priority !== "Alta"),
    ...mexicoRequirementCards
  ];

  return {
    alerts: buildAlerts({
      application,
      cards: allCards,
      payments
    }),
    filters: [
      { id: "all", label: "Todos" },
      { id: "pending", label: "Pendientes" },
      { id: "client", label: "Cliente" },
      { id: "internal", label: "Interno" },
      { id: "documents", label: "Documentos" },
      { id: "payments", label: "Pagos" },
      { id: "stage", label: "Etapa actual" }
    ],
    groups: [
      makeGroup({
        id: "travelers",
        items: travelerCards,
        summary: `${application.travelers.length} de ${application.total_people} registradas`,
        title: "Personas que viajan"
      }),
      makeGroup({
        id: "receivingContact",
        items: receivingContactCards,
        summary: application.receiving_contact ? "Completo" : "Pendiente",
        title: "Contacto que recibe"
      }),
      makeGroup({
        id: "documents",
        items: documentCards,
        summary: `${documentCards.filter(isCardPending).length} con atencion`,
        title: "Documentacion"
      }),
      makeGroup({
        id: "payments",
        items: paymentCards,
        summary: `${paymentCards.filter(isCardPending).length} pendiente(s)`,
        title: "Compromisos de pago"
      }),
      makeGroup({
        id: "stage",
        items: stageCards,
        summary: `${checklist.filter((item) => item.completed).length}/${checklist.length} checks`,
        title: "Etapa actual / checklist interno"
      }),
      makeGroup({
        id: "mexicoRequirements",
        items: mexicoRequirementCards,
        summary: `${mexicoRequirementCards.length} requisito(s)`,
        title: "Requisitos Mexico"
      })
    ].filter((group) => group.items.length > 0 || group.id === "payments"),
    summary: buildSummary({
      application,
      documentCards,
      paymentCards
    })
  };
}
