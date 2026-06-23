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
  "bienvenida",
  "informacion_inicial",
  "fecha_solicitada",
  "fecha_autorizada",
  "documentacion",
  "revision_expediente",
  "preparacion_viaje",
  "llegada_oficina",
  "acompanamiento_programado",
  "en_destino",
  "bienvenido"
] as const;

export const APPLICATION_STATUSES = [
  "draft",
  "active",
  "in_review",
  "paused",
  "completed",
  "cancelled"
] as const;

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
  { label: "Mexico", value: "+52" },
  { label: "Estados Unidos", value: "+1" },
  { label: "Colombia", value: "+57" },
  { label: "Guatemala", value: "+502" },
  { label: "Honduras", value: "+504" },
  { label: "El Salvador", value: "+503" },
  { label: "Nicaragua", value: "+505" },
  { label: "Costa Rica", value: "+506" },
  { label: "Panama", value: "+507" },
  { label: "Venezuela", value: "+58" },
  { label: "Ecuador", value: "+593" },
  { label: "Peru", value: "+51" }
] as const;

export const OTP_CODE_LENGTH = 6;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_EXPIRATION_MINUTES = 10;

export const VERIFICATION_CODE_LENGTH = OTP_CODE_LENGTH;
