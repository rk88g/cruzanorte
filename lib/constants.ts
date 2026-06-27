import type { ApplicationStage } from "@/types/database";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://cruzanorte.vercel.app";

export const PROJECT = {
  name: "Cruza Norte",
  defaultTitle: "Cruza Norte | Tu camino al norte empieza aqui",
  description:
    "Acompanamiento profesional para organizar documentacion, revisar informacion y dar seguimiento por etapas a tu proceso.",
  openGraphDescription:
    "Acompanamiento profesional, documentacion organizada y seguimiento por etapas.",
  siteUrl: SITE_URL,
  openGraphImage: "/og/cruza-norte-og.png",
  keywords: [
    "Cruza Norte",
    "acompanamiento migratorio",
    "documentacion migratoria",
    "seguimiento de proceso",
    "orientacion para viajar",
    "proceso guiado",
    "revision documental",
    "casos dificiles",
    "apoyo para documentacion",
    "preparacion de viaje"
  ],
  supportWhatsapp: "+5210000000000"
} as const;

export const USER_ROLES = ["client", "owner", "advisor", "reviewer", "support"] as const;

export const USER_STATUSES = ["active", "inactive", "blocked", "pending"] as const;

export const APPLICATION_STAGES = [
  {
    slug: "bienvenida",
    label: "Bienvenida",
    progress: 5
  },
  {
    slug: "informacion_inicial",
    label: "Informacion inicial",
    progress: 15
  },
  {
    slug: "fecha_solicitada",
    label: "Fecha solicitada",
    progress: 25
  },
  {
    slug: "fecha_autorizada",
    label: "Fecha autorizada",
    progress: 30
  },
  {
    slug: "documentacion",
    label: "Documentacion",
    progress: 45
  },
  {
    slug: "revision_expediente",
    label: "Revision de expediente",
    progress: 60
  },
  {
    slug: "preparacion_viaje",
    label: "Preparacion de viaje",
    progress: 70
  },
  {
    slug: "llegada_oficina",
    label: "Llegada a oficina",
    progress: 80
  },
  {
    slug: "acompanamiento_programado",
    label: "Acompanamiento programado",
    progress: 90
  },
  {
    slug: "en_destino",
    label: "En destino",
    progress: 97
  },
  {
    slug: "bienvenido",
    label: "Bienvenido",
    progress: 100
  }
] as const;

export const DEFAULT_APPLICATION_STAGE: ApplicationStage = "bienvenida";
export const DEFAULT_APPLICATION_PROGRESS = 5;
export const APPLICATION_START_STAGE: ApplicationStage = "informacion_inicial";
export const APPLICATION_START_PROGRESS = 15;
export const APPLICATION_DATE_REQUEST_STAGE: ApplicationStage = "fecha_solicitada";
export const APPLICATION_DATE_REQUEST_PROGRESS = 25;
export const APPLICATION_DATE_APPROVED_STAGE: ApplicationStage = "fecha_autorizada";
export const APPLICATION_DATE_APPROVED_PROGRESS = 30;

export const PROCESS_REASON_OPTIONS = [
  "Turismo",
  "Trabajo",
  "Asilo politico",
  "Reunificacion familiar",
  "Caso dificil",
  "Revision de informacion",
  "Otro"
] as const;

export const APPLICATION_COUNTRY_OPTIONS = [
  "Mexico",
  "Estados Unidos",
  "Guatemala",
  "Honduras",
  "El Salvador",
  "Nicaragua",
  "Costa Rica",
  "Panama",
  "Colombia",
  "Venezuela",
  "Ecuador",
  "Peru",
  "Otro"
] as const;

export const TRAVELER_RELATIONSHIP_OPTIONS = [
  "Cliente principal",
  "Esposo/a",
  "Hijo/a",
  "Padre",
  "Madre",
  "Hermano/a",
  "Familiar",
  "Amigo/a",
  "Otro"
] as const;

export const RECEIVING_CONTACT_RELATIONSHIP_OPTIONS = [
  "Familiar",
  "Padre",
  "Madre",
  "Hermano/a",
  "Hijo/a",
  "Esposo/a",
  "Amigo/a",
  "Contacto de confianza",
  "Otro"
] as const;

export const US_CITY_OTHER_VALUE = "__other__";

export const APPLICATION_STATUSES = [
  "draft",
  "active",
  "in_review",
  "paused",
  "completed",
  "cancelled"
] as const;

export const AVAILABLE_DATE_STATUSES = [
  "available",
  "limited",
  "full",
  "closed",
  "cancelled"
] as const;

export const AVAILABLE_DATE_STATUS_LABELS = {
  available: "Disponible",
  limited: "Cupo limitado",
  full: "Llena",
  closed: "Cerrada",
  cancelled: "Cancelada"
} as const;

export const REQUESTED_DATE_STATUSES = [
  "none",
  "requested",
  "approved",
  "rejected",
  "cancelled"
] as const;

export const REQUESTED_DATE_STATUS_LABELS = {
  none: "Sin fecha",
  requested: "Fecha solicitada",
  approved: "Fecha autorizada",
  rejected: "Fecha rechazada",
  cancelled: "Fecha cancelada"
} as const;

export const AVAILABLE_DATE_LOCATION_OPTIONS = ["Mexicali", "Tijuana", "Otra"] as const;
export const AVAILABLE_DATE_OTHER_LOCATION_VALUE = "Otra";

export const MEXICO_ENTRY_STATUSES = [
  "not_reviewed",
  "not_required",
  "required",
  "in_review",
  "approved",
  "rejected",
  "needs_more_information"
] as const;

export const MEXICO_REQUIREMENT_TYPES = [
  "mexico_visa",
  "travel_authorization",
  "identity_document",
  "flight_ticket",
  "hotel_or_address_reference",
  "financial_support",
  "additional_document",
  "other"
] as const;

export const MEXICO_REQUIREMENT_STATUSES = [
  "pending",
  "requested",
  "uploaded",
  "in_review",
  "accepted",
  "rejected",
  "replacement_requested",
  "not_required"
] as const;

export const DOCUMENT_STATUSES = [
  "pending",
  "uploaded",
  "in_review",
  "accepted",
  "rejected",
  "replacement_requested"
] as const;

export const DOCUMENT_STATUS_LABELS = {
  pending: "Pendiente",
  uploaded: "Cargado",
  in_review: "En revision",
  accepted: "Aceptado",
  rejected: "Rechazado",
  replacement_requested: "Reemplazo solicitado"
} as const;

export const DOCUMENT_STATUS_DESCRIPTIONS = {
  pending: "Aun no se ha subido este documento.",
  uploaded: "Documento recibido. Esta pendiente de revision.",
  in_review: "El documento esta siendo revisado.",
  accepted: "Documento aceptado.",
  rejected: "El documento requiere atencion. Revisa el comentario.",
  replacement_requested: "Se solicito cargar una nueva version del documento."
} as const;

export const GENERAL_DOCUMENT_TYPES = [
  "general_information",
  "travel_itinerary",
  "additional_support",
  "other"
] as const;

export const GENERAL_DOCUMENT_LABELS = {
  general_information: "Informacion general",
  travel_itinerary: "Itinerario o comprobante de viaje",
  additional_support: "Soporte adicional",
  other: "Otro documento"
} as const;

export const REQUIRED_GENERAL_DOCUMENT_TYPES = [
  "general_information",
  "travel_itinerary",
  "additional_support"
] as const;

export const TRAVELER_DOCUMENT_TYPES = [
  "official_id",
  "passport",
  "birth_certificate",
  "recent_photo",
  "proof_of_address",
  "travel_ticket",
  "additional_document"
] as const;

export const TRAVELER_DOCUMENT_LABELS = {
  official_id: "Identificacion oficial",
  passport: "Pasaporte",
  birth_certificate: "Acta o documento de nacimiento",
  recent_photo: "Fotografia reciente",
  proof_of_address: "Comprobante de domicilio",
  travel_ticket: "Ticket o comprobante de viaje",
  additional_document: "Documento adicional"
} as const;

export const REQUIRED_TRAVELER_DOCUMENT_TYPES = [
  "official_id",
  "passport",
  "recent_photo",
  "additional_document"
] as const;

export const MEXICO_REVIEW_DOCUMENT_TYPES = [
  "mexico_visa",
  "travel_authorization",
  "identity_document",
  "flight_ticket",
  "address_reference",
  "financial_support",
  "additional_document"
] as const;

export const MEXICO_REVIEW_DOCUMENT_LABELS = {
  mexico_visa: "Visa para Mexico, si aplica",
  travel_authorization: "Autorizacion o documentacion previa",
  identity_document: "Documento de identidad",
  flight_ticket: "Ticket de vuelo",
  address_reference: "Direccion o referencia",
  financial_support: "Soporte financiero",
  additional_document: "Documento adicional"
} as const;

export const DOCUMENT_SCOPE_LABELS = {
  application: "Solicitud",
  traveler: "Persona que viaja",
  mexico_requirement: "Revision Mexico"
} as const;

export const DOCUMENT_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp"
] as const;

export const DOCUMENT_UPLOAD_BUCKET = "documents";
export const PAYMENT_RECEIPT_UPLOAD_BUCKET = "payment-receipts";
export const DOCUMENTATION_STAGE: ApplicationStage = "documentacion";
export const DOCUMENTATION_PROGRESS = 45;

export const PAYMENT_METHODS = ["manual", "mercadopago", "stripe"] as const;

export const PAYMENT_PROVIDERS = ["none", "mercadopago", "stripe"] as const;

export const PAYMENT_SCOPES = [
  "application",
  "group",
  "traveler",
  "stage",
  "mexico_entry_requirement",
  "documentation",
  "office_arrival",
  "before_mexico_arrival",
  "after_mexico_arrival",
  "extra",
  "special_agreement"
] as const;

export const PAYMENT_SCOPE_LABELS = {
  application: "Solicitud",
  group: "Grupo",
  traveler: "Persona",
  stage: "Etapa",
  mexico_entry_requirement: "Requisito Mexico",
  documentation: "Documentacion",
  office_arrival: "Llegada a oficina",
  before_mexico_arrival: "Antes de llegar a Mexico",
  after_mexico_arrival: "Despues de llegar a Mexico",
  extra: "Extra",
  special_agreement: "Acuerdo especial"
} as const;

export const PAYMENT_TYPES = [
  "fixed",
  "percentage",
  "per_person",
  "per_group",
  "partial",
  "monthly",
  "stage_payment",
  "extra",
  "special"
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "requested",
  "in_review",
  "partial",
  "paid",
  "overdue",
  "rejected",
  "cancelled",
  "conditioned",
  "special_agreement"
] as const;

export const PAYMENT_STATUS_LABELS = {
  pending: "Pendiente",
  requested: "Solicitado",
  in_review: "En revision",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  conditioned: "Condicionado",
  special_agreement: "Acuerdo especial"
} as const;

export const TIMELINE_STATUSES = [
  "pending",
  "in_progress",
  "in_review",
  "completed",
  "paused",
  "requires_information",
  "blocked_by_payment"
] as const;

export const PHONE_FIELDS_REQUIRED = ["country_code", "phone_number", "whatsapp_e164"] as const;

export const COUNTRY_CODE_OPTIONS = [
  { label: "🇲🇽 México (+52)", value: "+52" },
  { label: "🇺🇸 Estados Unidos (+1)", value: "+1" },
  { label: "🇨🇴 Colombia (+57)", value: "+57" },
  { label: "🇬🇹 Guatemala (+502)", value: "+502" },
  { label: "🇭🇳 Honduras (+504)", value: "+504" },
  { label: "🇸🇻 El Salvador (+503)", value: "+503" },
  { label: "🇳🇮 Nicaragua (+505)", value: "+505" },
  { label: "🇨🇷 Costa Rica (+506)", value: "+506" },
  { label: "🇵🇦 Panamá (+507)", value: "+507" },
  { label: "🇻🇪 Venezuela (+58)", value: "+58" },
  { label: "🇪🇨 Ecuador (+593)", value: "+593" },
  { label: "🇵🇪 Perú (+51)", value: "+51" }
] as const;

export const OTP_CODE_LENGTH = 6;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_EXPIRATION_MINUTES = 10;

export const VERIFICATION_CODE_LENGTH = OTP_CODE_LENGTH;
