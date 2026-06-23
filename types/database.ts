export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "client" | "owner" | "advisor" | "reviewer" | "support";
export type UserStatus = "active" | "inactive" | "blocked" | "pending";

export type ApplicationStatus =
  | "draft"
  | "active"
  | "in_review"
  | "paused"
  | "completed"
  | "cancelled";

export type ApplicationStage =
  | "bienvenida"
  | "informacion_inicial"
  | "fecha_solicitada"
  | "fecha_autorizada"
  | "documentacion"
  | "revision_expediente"
  | "preparacion_viaje"
  | "llegada_oficina"
  | "acompanamiento_programado"
  | "en_destino"
  | "bienvenido";

export type MexicoEntryStatus =
  | "not_reviewed"
  | "not_required"
  | "required"
  | "in_review"
  | "approved"
  | "rejected"
  | "needs_more_information";

export type MexicoRequirementType =
  | "mexico_visa"
  | "travel_authorization"
  | "identity_document"
  | "flight_ticket"
  | "hotel_or_address_reference"
  | "financial_support"
  | "additional_document"
  | "other";

export type MexicoRequirementStatus =
  | "pending"
  | "requested"
  | "uploaded"
  | "in_review"
  | "accepted"
  | "rejected"
  | "replacement_requested"
  | "not_required";

export type DocumentStatus =
  | "pending"
  | "uploaded"
  | "in_review"
  | "accepted"
  | "rejected"
  | "replacement_requested";

export type PaymentStatus =
  | "pending"
  | "requested"
  | "in_review"
  | "partial"
  | "paid"
  | "overdue"
  | "rejected"
  | "cancelled"
  | "conditioned"
  | "special_agreement";

export type PaymentType =
  | "fixed"
  | "percentage"
  | "per_person"
  | "per_group"
  | "partial"
  | "monthly"
  | "stage_payment"
  | "extra"
  | "special";

export type PaymentScope =
  | "application"
  | "group"
  | "traveler"
  | "stage"
  | "mexico_entry_requirement"
  | "documentation"
  | "office_arrival"
  | "before_mexico_arrival"
  | "after_mexico_arrival"
  | "extra"
  | "special_agreement";

export type TimelineStatus =
  | "pending"
  | "in_progress"
  | "in_review"
  | "completed"
  | "paused"
  | "requires_information"
  | "blocked_by_payment";

export type AvailableDateStatus = "available" | "limited" | "full" | "closed" | "cancelled";
export type PaymentPlanItemStatus = "active" | "paused" | "completed" | "cancelled";
export type PaymentReceiptStatus = "uploaded" | "in_review" | "accepted" | "rejected" | "replacement_requested";

export type PhoneFields = {
  country_code: string;
  phone_number: string;
  whatsapp_e164: string;
};

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type Insertable<Row, RequiredKeys extends keyof Row = never> = Partial<Row> & Pick<Row, RequiredKeys>;

export type UserRow = PhoneFields & {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

export type WhatsappOtpRow = PhoneFields & {
  id: string;
  code_hash: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  consumed_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type ApplicationRow = {
  id: string;
  client_id: string;
  main_contact_name: string | null;
  current_stage: ApplicationStage;
  progress: number;
  status: ApplicationStatus;
  assigned_user_id: string | null;
  requested_date_id: string | null;
  approved_date_id: string | null;
  total_people: number;
  origin_country: string | null;
  origin_city: string | null;
  arrival_country: string;
  arrival_city: string | null;
  requires_mexico_entry_review: boolean;
  mexico_entry_status: MexicoEntryStatus;
  notes_public: string | null;
  notes_internal: string | null;
  created_at: string;
  updated_at: string;
};

export type TravelerRow = {
  id: string;
  application_id: string;
  full_name: string;
  birth_date: string | null;
  age: number | null;
  country_origin: string | null;
  nationality: string | null;
  relationship: string | null;
  country_code: string | null;
  phone_number: string | null;
  whatsapp_e164: string | null;
  email: string | null;
  is_main_client: boolean;
  requires_mexico_entry_review: boolean;
  mexico_entry_status: MexicoEntryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ReceivingContactRow = PhoneFields & {
  id: string;
  application_id: string;
  full_name: string;
  relationship: string | null;
  us_state_id: string | null;
  us_city_id: string | null;
  city_other: string | null;
  address_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type UsStateRow = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
};

export type UsCityRow = {
  id: string;
  state_id: string;
  name: string;
  is_major: boolean;
  active: boolean;
  created_at: string;
};

export type AvailableDateRow = {
  id: string;
  date: string;
  location_city: string | null;
  capacity_total: number;
  capacity_available: number;
  status: AvailableDateStatus;
  notes_internal: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TravelerMexicoEntryRequirementRow = {
  id: string;
  traveler_id: string;
  application_id: string;
  requirement_type: MexicoRequirementType;
  requirement_name: string;
  status: MexicoRequirementStatus;
  notes_public: string | null;
  notes_internal: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
};

export type DocumentRow = {
  id: string;
  application_id: string;
  traveler_id: string | null;
  mexico_requirement_id: string | null;
  document_type: string;
  file_path: string | null;
  file_name: string | null;
  file_mime_type: string | null;
  file_size: number | null;
  status: DocumentStatus;
  admin_notes: string | null;
  client_notes: string | null;
  uploaded_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type TimelineEventRow = {
  id: string;
  application_id: string;
  payment_id: string | null;
  mexico_requirement_id: string | null;
  stage: string;
  title: string;
  description: string | null;
  status: TimelineStatus;
  progress_value: number;
  visible_to_client: boolean;
  created_by: string | null;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  application_id: string;
  client_id: string;
  traveler_id: string | null;
  mexico_requirement_id: string | null;
  stage: string | null;
  concept: string;
  description: string | null;
  amount: number;
  currency: string;
  payment_type: PaymentType;
  payment_scope: PaymentScope;
  percentage: number | null;
  due_date: string | null;
  status: PaymentStatus;
  blocks_progress: boolean;
  is_extra_payment: boolean;
  is_financed: boolean;
  financing_months: number | null;
  promotion_name: string | null;
  discount_amount: number;
  discount_percentage: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentPlanItemRow = {
  id: string;
  application_id: string;
  stage: string | null;
  title: string;
  description: string | null;
  payment_scope: PaymentScope;
  amount: number | null;
  percentage: number | null;
  currency: string;
  required_before_stage: string | null;
  blocks_progress: boolean;
  sort_order: number;
  status: PaymentPlanItemStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentReceiptRow = {
  id: string;
  payment_id: string;
  application_id: string;
  traveler_id: string | null;
  file_path: string | null;
  file_name: string | null;
  amount_reported: number | null;
  currency: string;
  status: PaymentReceiptStatus;
  admin_notes: string | null;
  client_notes: string | null;
  uploaded_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type MessageRow = {
  id: string;
  application_id: string;
  sender_id: string | null;
  message: string;
  attachment_path: string | null;
  visible_to_client: boolean;
  read_at: string | null;
  created_at: string;
};

export type InternalNoteRow = {
  id: string;
  application_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
};

export type ActivityLogRow = {
  id: string;
  user_id: string | null;
  application_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Json;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: TableDefinition<UserRow, Insertable<UserRow, keyof PhoneFields>>;
      whatsapp_otps: TableDefinition<
        WhatsappOtpRow,
        Insertable<WhatsappOtpRow, keyof PhoneFields | "code_hash" | "expires_at">
      >;
      applications: TableDefinition<ApplicationRow, Insertable<ApplicationRow, "client_id">>;
      travelers: TableDefinition<TravelerRow, Insertable<TravelerRow, "application_id" | "full_name">>;
      receiving_contacts: TableDefinition<
        ReceivingContactRow,
        Insertable<ReceivingContactRow, "application_id" | "full_name" | keyof PhoneFields>
      >;
      us_states: TableDefinition<UsStateRow, Insertable<UsStateRow, "name" | "code">>;
      us_cities: TableDefinition<UsCityRow, Insertable<UsCityRow, "state_id" | "name">>;
      available_dates: TableDefinition<AvailableDateRow, Insertable<AvailableDateRow, "date">>;
      traveler_mexico_entry_requirements: TableDefinition<
        TravelerMexicoEntryRequirementRow,
        Insertable<
          TravelerMexicoEntryRequirementRow,
          "traveler_id" | "application_id" | "requirement_type" | "requirement_name"
        >
      >;
      documents: TableDefinition<DocumentRow, Insertable<DocumentRow, "application_id" | "document_type">>;
      timeline_events: TableDefinition<
        TimelineEventRow,
        Insertable<TimelineEventRow, "application_id" | "stage" | "title">
      >;
      payments: TableDefinition<
        PaymentRow,
        Insertable<PaymentRow, "application_id" | "client_id" | "concept" | "amount">
      >;
      payment_plan_items: TableDefinition<
        PaymentPlanItemRow,
        Insertable<PaymentPlanItemRow, "application_id" | "title" | "payment_scope">
      >;
      payment_receipts: TableDefinition<
        PaymentReceiptRow,
        Insertable<PaymentReceiptRow, "payment_id" | "application_id">
      >;
      messages: TableDefinition<MessageRow, Insertable<MessageRow, "application_id" | "message">>;
      internal_notes: TableDefinition<InternalNoteRow, Insertable<InternalNoteRow, "application_id" | "note">>;
      activity_logs: TableDefinition<ActivityLogRow, Insertable<ActivityLogRow, "action">>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
