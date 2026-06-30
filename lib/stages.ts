import { APPLICATION_STAGES, DOCUMENTATION_STAGE } from "@/lib/constants";
import { CLIENT_ROUTES } from "@/lib/routes";
import type { ApplicationStage, DocumentStatus } from "@/types/database";

type DocumentUploadState = {
  status: DocumentStatus;
} | null;

type ClientNextStepApplication = {
  current_stage: ApplicationStage;
  document_accepted_count: number;
  document_pending_review_count: number;
  document_rejected_count: number;
  document_replacement_requested_count: number;
  receiving_contact_exists: boolean;
  requested_date_status: string;
  required_document_count: number;
  total_people: number;
  travelers_count: number;
};

export type ClientNextStepContent = {
  actionHref?: string;
  actionLabel: string;
  description: string;
  title: string;
};

export type ClientStageOverviewContent = {
  description: string;
  statusLabel: string;
  title: string;
};

export type InternalStageChecklistDefinition = {
  detail: string;
  id: string;
  label: string;
};

export function getStageOrder(stage: ApplicationStage | string | null | undefined) {
  return APPLICATION_STAGES.findIndex((item) => item.slug === stage);
}

export function isStageAtOrAfter(
  currentStage: ApplicationStage | string | null | undefined,
  targetStage: ApplicationStage
) {
  const currentOrder = getStageOrder(currentStage);
  const targetOrder = getStageOrder(targetStage);

  return currentOrder >= 0 && targetOrder >= 0 && currentOrder >= targetOrder;
}

export function isDocumentationStageOpen(
  currentStage: ApplicationStage | string | null | undefined
) {
  const currentOrder = getStageOrder(currentStage);
  const documentationOrder = getStageOrder(DOCUMENTATION_STAGE);

  return currentOrder >= 0 && documentationOrder >= 0 && currentOrder <= documentationOrder;
}

export function shouldShowAutomaticDocumentRequirements(
  currentStage: ApplicationStage | string | null | undefined
) {
  return isDocumentationStageOpen(currentStage);
}

export function shouldShowDocumentUploadForm({
  currentStage,
  document
}: {
  currentStage: ApplicationStage | string | null | undefined;
  document: DocumentUploadState;
}) {
  if (document?.status === "rejected" || document?.status === "replacement_requested") {
    return true;
  }

  if (!document || document.status === "pending") {
    return isDocumentationStageOpen(currentStage);
  }

  return false;
}

export const CLIENT_STAGE_OVERVIEWS = {
  revision_expediente: {
    title: "Revision de expediente",
    description:
      "Tu informacion se encuentra en etapa de revision. El equipo dara seguimiento a los puntos necesarios y actualizara el avance del proceso.",
    statusLabel: "Revision activa"
  },
  preparacion_viaje: {
    title: "Preparacion de viaje",
    description:
      "Tu proceso se encuentra en preparacion. Revisa las indicaciones disponibles y mantente atento a las actualizaciones del equipo.",
    statusLabel: "Preparacion en curso"
  },
  llegada_oficina: {
    title: "Llegada a oficina",
    description:
      "Tu proceso se encuentra en etapa de recepcion y seguimiento en oficina. Revisa las indicaciones disponibles y mantente atento a las actualizaciones del equipo.",
    statusLabel: "Recepcion y seguimiento"
  },
  acompanamiento_programado: {
    title: "Acompanamiento programado",
    description:
      "El equipo dara seguimiento a las actividades programadas para esta etapa. Mantente atento a las actualizaciones de tu proceso.",
    statusLabel: "Seguimiento activo"
  },
  en_destino: {
    title: "En destino",
    description:
      "Tu proceso se encuentra en etapa de confirmacion de destino. El equipo actualizara el estado final cuando la informacion sea revisada.",
    statusLabel: "Confirmacion en revision"
  },
  bienvenido: {
    title: "Bienvenido",
    description:
      "Tu proceso ha sido marcado como finalizado. Gracias por confiar en Cruza Norte.",
    statusLabel: "Proceso finalizado"
  }
} as const satisfies Partial<Record<ApplicationStage, ClientStageOverviewContent>>;

export function getClientStageOverviewContent(
  currentStage: ApplicationStage | string | null | undefined
) {
  if (currentStage && currentStage in CLIENT_STAGE_OVERVIEWS) {
    return CLIENT_STAGE_OVERVIEWS[currentStage as keyof typeof CLIENT_STAGE_OVERVIEWS];
  }

  const stage = APPLICATION_STAGES.find((item) => item.slug === currentStage);

  return {
    title: stage?.label ?? "Etapa actual",
    description:
      "Consulta el avance actual de tu proceso y mantente atento a las actualizaciones del equipo.",
    statusLabel: "Seguimiento activo"
  } satisfies ClientStageOverviewContent;
}

export function getClientNextStep(
  activeApplication: ClientNextStepApplication | null,
  _documents: unknown[] = [],
  _payments: unknown[] = []
): ClientNextStepContent {
  void _documents;
  void _payments;

  if (!activeApplication) {
    return {
      title: "Inicia tu registro",
      description: "Completa tu informacion inicial para comenzar a organizar tu proceso.",
      actionLabel: "Comenzar registro",
      actionHref: CLIENT_ROUTES.registro
    };
  }

  if (!isDocumentationStageOpen(activeApplication.current_stage)) {
    const content = getClientStageOverviewContent(activeApplication.current_stage);

    return {
      title: content.title,
      description: content.description,
      actionLabel: "Ver etapa actual",
      actionHref: CLIENT_ROUTES.llegadaOficina
    };
  }

  if (activeApplication.travelers_count < activeApplication.total_people) {
    return {
      title: "Agrega las personas que viajan",
      description: "Completa la informacion de las personas incluidas en tu proceso.",
      actionLabel: "Agregar personas",
      actionHref: CLIENT_ROUTES.personas
    };
  }

  if (!activeApplication.receiving_contact_exists) {
    return {
      title: "Agrega el contacto que recibe",
      description:
        "Registra la informacion de la persona que recibira al grupo en Estados Unidos.",
      actionLabel: "Agregar contacto",
      actionHref: CLIENT_ROUTES.contactoRecibe
    };
  }

  if (activeApplication.requested_date_status === "approved") {
    if (
      activeApplication.document_replacement_requested_count > 0 ||
      activeApplication.document_rejected_count > 0
    ) {
      return {
        title: "Reemplazo de documento pendiente",
        description:
          "Revisa los comentarios y sube una nueva version del documento solicitado.",
        actionLabel: "Revisar documentacion",
        actionHref: CLIENT_ROUTES.documentacion
      };
    }

    if (
      activeApplication.required_document_count > 0 &&
      activeApplication.document_accepted_count >= activeApplication.required_document_count
    ) {
      return {
        title: "Revision de expediente",
        description:
          "Tu documentacion fue revisada. El siguiente paso sera la revision del expediente.",
        actionLabel: "Disponible proximamente"
      };
    }

    if (activeApplication.document_pending_review_count > 0) {
      return {
        title: "Documentacion en revision",
        description: "Tus documentos fueron recibidos y estan en revision.",
        actionLabel: "Revisar documentacion",
        actionHref: CLIENT_ROUTES.documentacion
      };
    }

    return {
      title: "Sube tu documentacion",
      description: "Carga los documentos solicitados para que puedan ser revisados.",
      actionLabel: "Revisar documentacion",
      actionHref: CLIENT_ROUTES.documentacion
    };
  }

  if (activeApplication.requested_date_status === "requested") {
    return {
      title: "Fecha en revision",
      description:
        "Tu fecha fue enviada para revision. Te avisaremos cuando sea autorizada.",
      actionLabel: "Ver fechas disponibles",
      actionHref: CLIENT_ROUTES.fecha
    };
  }

  if (activeApplication.requested_date_status === "rejected") {
    return {
      title: "Solicita una nueva fecha",
      description: "La fecha anterior no fue autorizada. Puedes seleccionar otra fecha disponible.",
      actionLabel: "Ver fechas disponibles",
      actionHref: CLIENT_ROUTES.fecha
    };
  }

  return {
    title: "Solicita una fecha",
    description: "Selecciona una fecha disponible para enviarla a revision.",
    actionLabel: "Ver fechas disponibles",
    actionHref: CLIENT_ROUTES.fecha
  };
}

export const INTERNAL_STAGE_CHECKLISTS = {
  llegada_oficina: [
    {
      id: "arrival-confirmed",
      label: "Llegada confirmada",
      detail: "Validar que la llegada del grupo fue registrada."
    },
    {
      id: "identity-reviewed",
      label: "Identidad del grupo verificada",
      detail: "Revisar que los datos principales coincidan con la solicitud."
    },
    {
      id: "travelers-present",
      label: "Personas del grupo presentes",
      detail: "Confirmar que las personas incluidas fueron revisadas."
    },
    {
      id: "main-data-reviewed",
      label: "Datos principales revisados",
      detail: "Revisar nombre principal, origen y numero de personas."
    },
    {
      id: "receiving-contact-confirmed",
      label: "Contacto que recibe confirmado",
      detail: "Confirmar datos del contacto que recibe en Estados Unidos."
    },
    {
      id: "date-base-confirmed",
      label: "Fecha y base confirmadas",
      detail: "Validar fecha autorizada y ciudad o base registrada."
    },
    {
      id: "payments-reviewed",
      label: "Compromisos de pago revisados",
      detail: "Revisar si existen compromisos pendientes relacionados con el proceso."
    },
    {
      id: "receipt-reviewed",
      label: "Comprobante pendiente revisado",
      detail: "Revisar comprobantes pendientes, si aplica."
    },
    {
      id: "internal-observations",
      label: "Observaciones internas registradas",
      detail: "Registrar notas internas necesarias para seguimiento."
    },
    {
      id: "general-status-updated",
      label: "Estado general actualizado",
      detail: "Confirmar que el estado general refleja la etapa actual."
    }
  ],
  acompanamiento_programado: [
    {
      id: "group-ready",
      label: "Grupo listo",
      detail: "Confirmar que el grupo esta listo para la etapa de seguimiento."
    },
    {
      id: "internal-owner",
      label: "Responsable interno asignado",
      detail: "Revisar asignacion interna de seguimiento."
    },
    {
      id: "destination-data-reviewed",
      label: "Datos de destino revisados",
      detail: "Validar informacion general de destino."
    },
    {
      id: "receiving-contact-confirmed",
      label: "Contacto que recibe confirmado",
      detail: "Confirmar contacto receptor registrado."
    },
    {
      id: "payments-reviewed",
      label: "Compromisos pendientes revisados",
      detail: "Revisar compromisos pendientes antes de continuar."
    },
    {
      id: "active-follow-up",
      label: "Seguimiento activo",
      detail: "Mantener actualizaciones internas del proceso."
    },
    {
      id: "internal-observations",
      label: "Observaciones internas",
      detail: "Registrar observaciones internas relevantes."
    }
  ],
  en_destino: [
    {
      id: "destination-confirmed",
      label: "Llegada a destino confirmada",
      detail: "Confirmar estado de destino dentro del seguimiento interno."
    },
    {
      id: "receiving-contact-confirmed",
      label: "Contacto receptor confirmado",
      detail: "Validar contacto receptor registrado."
    },
    {
      id: "closure-evidence",
      label: "Evidencia de cierre registrada",
      detail: "Registrar evidencia de cierre, si aplica."
    },
    {
      id: "final-observations",
      label: "Observaciones finales",
      detail: "Registrar observaciones finales del proceso."
    },
    {
      id: "payments-reviewed",
      label: "Pagos pendientes revisados",
      detail: "Revisar compromisos pendientes antes del cierre."
    },
    {
      id: "ready-to-close",
      label: "Estado listo para finalizar",
      detail: "Confirmar que el estado puede avanzar a finalizado."
    }
  ],
  bienvenido: [
    {
      id: "process-finished",
      label: "Proceso finalizado",
      detail: "Confirmar cierre general del proceso."
    },
    {
      id: "application-closed",
      label: "Solicitud cerrada",
      detail: "Revisar cierre administrativo de la solicitud."
    },
    {
      id: "documents-payments-reviewed",
      label: "Documentos y pagos revisados",
      detail: "Confirmar revision general de documentos y compromisos."
    },
    {
      id: "final-observations",
      label: "Observaciones finales registradas",
      detail: "Registrar observaciones finales internas."
    },
    {
      id: "review-requested",
      label: "Resena solicitada",
      detail: "Preparar solicitud de resena, si aplica."
    }
  ]
} as const satisfies Partial<Record<ApplicationStage, readonly InternalStageChecklistDefinition[]>>;

export function getInternalStageChecklist(
  currentStage: ApplicationStage | string | null | undefined
) {
  if (currentStage && currentStage in INTERNAL_STAGE_CHECKLISTS) {
    return INTERNAL_STAGE_CHECKLISTS[currentStage as keyof typeof INTERNAL_STAGE_CHECKLISTS];
  }

  return [];
}
