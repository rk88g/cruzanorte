create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  phone_number text not null,
  whatsapp_e164 text unique not null,
  full_name text,
  email text,
  role text not null default 'client',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_role_check check (role in ('client', 'owner', 'advisor', 'reviewer', 'support')),
  constraint users_status_check check (status in ('active', 'inactive', 'blocked', 'pending')),
  constraint users_phone_check check (
    country_code ~ '^\+[1-9][0-9]{0,3}$'
    and phone_number ~ '^[0-9]{4,15}$'
    and whatsapp_e164 ~ '^\+[1-9][0-9]{7,15}$'
  )
);

create table if not exists public.whatsapp_otps (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  phone_number text not null,
  whatsapp_e164 text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  max_attempts int not null default 3,
  consumed_at timestamptz,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint whatsapp_otps_attempts_check check (attempts >= 0 and max_attempts > 0 and attempts <= max_attempts),
  constraint whatsapp_otps_phone_check check (
    country_code ~ '^\+[1-9][0-9]{0,3}$'
    and phone_number ~ '^[0-9]{4,15}$'
    and whatsapp_e164 ~ '^\+[1-9][0-9]{7,15}$'
  )
);

create table if not exists public.us_states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.us_cities (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.us_states(id) on delete cascade,
  name text not null,
  is_major boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint us_cities_state_name_unique unique (state_id, name)
);

create table if not exists public.available_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  location_city text,
  capacity_total int not null default 0,
  capacity_available int not null default 0,
  status text not null default 'available',
  notes_internal text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint available_dates_status_check check (status in ('available', 'limited', 'full', 'closed', 'cancelled')),
  constraint available_dates_capacity_check check (
    capacity_total >= 0
    and capacity_available >= 0
    and capacity_available <= capacity_total
  )
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  main_contact_name text,
  current_stage text not null default 'bienvenida',
  progress int not null default 5,
  status text not null default 'draft',
  assigned_user_id uuid references public.users(id),
  requested_date_id uuid references public.available_dates(id) on delete set null,
  approved_date_id uuid references public.available_dates(id) on delete set null,
  total_people int not null default 1,
  origin_country text,
  origin_city text,
  arrival_country text not null default 'Mexico',
  arrival_city text,
  requires_mexico_entry_review boolean not null default false,
  mexico_entry_status text not null default 'not_reviewed',
  notes_public text,
  notes_internal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_status_check check (status in ('draft', 'active', 'in_review', 'paused', 'completed', 'cancelled')),
  constraint applications_stage_check check (
    current_stage in (
      'bienvenida',
      'informacion_inicial',
      'fecha_solicitada',
      'fecha_autorizada',
      'documentacion',
      'revision_expediente',
      'preparacion_viaje',
      'llegada_oficina',
      'acompanamiento_programado',
      'en_destino',
      'bienvenido'
    )
  ),
  constraint applications_mexico_entry_status_check check (
    mexico_entry_status in (
      'not_reviewed',
      'not_required',
      'required',
      'in_review',
      'approved',
      'rejected',
      'needs_more_information'
    )
  ),
  constraint applications_progress_check check (progress >= 0 and progress <= 100),
  constraint applications_total_people_check check (total_people >= 1)
);

create table if not exists public.travelers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  full_name text not null,
  birth_date date,
  age int,
  country_origin text,
  nationality text,
  relationship text,
  country_code text,
  phone_number text,
  whatsapp_e164 text,
  email text,
  is_main_client boolean not null default false,
  requires_mexico_entry_review boolean not null default false,
  mexico_entry_status text not null default 'not_reviewed',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travelers_age_check check (age is null or age >= 0),
  constraint travelers_mexico_entry_status_check check (
    mexico_entry_status in (
      'not_reviewed',
      'not_required',
      'required',
      'in_review',
      'approved',
      'rejected',
      'needs_more_information'
    )
  ),
  constraint travelers_phone_check check (
    (
      country_code is null
      and phone_number is null
      and whatsapp_e164 is null
    )
    or (
      country_code is not null
      and phone_number is not null
      and whatsapp_e164 is not null
      and country_code ~ '^\+[1-9][0-9]{0,3}$'
      and phone_number ~ '^[0-9]{4,15}$'
      and whatsapp_e164 ~ '^\+[1-9][0-9]{7,15}$'
    )
  )
);

create table if not exists public.receiving_contacts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  full_name text not null,
  relationship text,
  country_code text not null,
  phone_number text not null,
  whatsapp_e164 text not null,
  us_state_id uuid references public.us_states(id),
  us_city_id uuid references public.us_cities(id),
  city_other text,
  address_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint receiving_contacts_phone_check check (
    country_code ~ '^\+[1-9][0-9]{0,3}$'
    and phone_number ~ '^[0-9]{4,15}$'
    and whatsapp_e164 ~ '^\+[1-9][0-9]{7,15}$'
  )
);

create table if not exists public.traveler_mexico_entry_requirements (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references public.travelers(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  requirement_type text not null,
  requirement_name text not null,
  status text not null default 'pending',
  notes_public text,
  notes_internal text,
  created_by uuid references public.users(id),
  reviewed_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint traveler_mexico_entry_requirements_type_check check (
    requirement_type in (
      'mexico_visa',
      'travel_authorization',
      'identity_document',
      'flight_ticket',
      'hotel_or_address_reference',
      'financial_support',
      'additional_document',
      'other'
    )
  ),
  constraint traveler_mexico_entry_requirements_status_check check (
    status in (
      'pending',
      'requested',
      'uploaded',
      'in_review',
      'accepted',
      'rejected',
      'replacement_requested',
      'not_required'
    )
  )
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  traveler_id uuid references public.travelers(id) on delete set null,
  mexico_requirement_id uuid references public.traveler_mexico_entry_requirements(id) on delete set null,
  document_type text not null,
  file_path text,
  file_name text,
  file_mime_type text,
  file_size int,
  status text not null default 'pending',
  admin_notes text,
  client_notes text,
  uploaded_by uuid references public.users(id),
  reviewed_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint documents_status_check check (
    status in ('pending', 'uploaded', 'in_review', 'accepted', 'rejected', 'replacement_requested')
  ),
  constraint documents_file_size_check check (file_size is null or file_size >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  traveler_id uuid references public.travelers(id) on delete set null,
  mexico_requirement_id uuid references public.traveler_mexico_entry_requirements(id) on delete set null,
  stage text,
  concept text not null,
  description text,
  amount numeric(12,2) not null,
  currency text not null default 'MXN',
  payment_type text not null default 'fixed',
  payment_scope text not null default 'application',
  percentage numeric(5,2),
  due_date date,
  status text not null default 'pending',
  blocks_progress boolean not null default false,
  is_extra_payment boolean not null default false,
  is_financed boolean not null default false,
  financing_months int,
  promotion_name text,
  discount_amount numeric(12,2) not null default 0,
  discount_percentage numeric(5,2),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_scope_check check (
    payment_scope in (
      'application',
      'group',
      'traveler',
      'stage',
      'mexico_entry_requirement',
      'documentation',
      'office_arrival',
      'before_mexico_arrival',
      'after_mexico_arrival',
      'extra',
      'special_agreement'
    )
  ),
  constraint payments_type_check check (
    payment_type in (
      'fixed',
      'percentage',
      'per_person',
      'per_group',
      'partial',
      'monthly',
      'stage_payment',
      'extra',
      'special'
    )
  ),
  constraint payments_status_check check (
    status in (
      'pending',
      'requested',
      'in_review',
      'partial',
      'paid',
      'overdue',
      'rejected',
      'cancelled',
      'conditioned',
      'special_agreement'
    )
  ),
  constraint payments_amount_check check (amount >= 0 and discount_amount >= 0),
  constraint payments_percentage_check check (
    (percentage is null or (percentage >= 0 and percentage <= 100))
    and (discount_percentage is null or (discount_percentage >= 0 and discount_percentage <= 100))
  ),
  constraint payments_financing_months_check check (financing_months is null or financing_months > 0)
);

create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  mexico_requirement_id uuid references public.traveler_mexico_entry_requirements(id) on delete set null,
  stage text not null,
  title text not null,
  description text,
  status text not null default 'pending',
  progress_value int not null default 0,
  visible_to_client boolean not null default true,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  constraint timeline_events_status_check check (
    status in (
      'pending',
      'in_progress',
      'in_review',
      'completed',
      'paused',
      'requires_information',
      'blocked_by_payment'
    )
  ),
  constraint timeline_events_progress_check check (progress_value >= 0 and progress_value <= 100)
);

create table if not exists public.payment_plan_items (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  stage text,
  title text not null,
  description text,
  payment_scope text not null default 'application',
  amount numeric(12,2),
  percentage numeric(5,2),
  currency text not null default 'MXN',
  required_before_stage text,
  blocks_progress boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'active',
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_plan_items_scope_check check (
    payment_scope in (
      'application',
      'group',
      'traveler',
      'stage',
      'mexico_entry_requirement',
      'documentation',
      'office_arrival',
      'before_mexico_arrival',
      'after_mexico_arrival',
      'extra',
      'special_agreement'
    )
  ),
  constraint payment_plan_items_status_check check (status in ('active', 'paused', 'completed', 'cancelled')),
  constraint payment_plan_items_amount_check check (amount is null or amount >= 0),
  constraint payment_plan_items_percentage_check check (percentage is null or (percentage >= 0 and percentage <= 100)),
  constraint payment_plan_items_amount_or_percentage_check check (amount is not null or percentage is not null)
);

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  traveler_id uuid references public.travelers(id) on delete set null,
  file_path text,
  file_name text,
  amount_reported numeric(12,2),
  currency text not null default 'MXN',
  status text not null default 'uploaded',
  admin_notes text,
  client_notes text,
  uploaded_by uuid references public.users(id),
  reviewed_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint payment_receipts_status_check check (
    status in ('uploaded', 'in_review', 'accepted', 'rejected', 'replacement_requested')
  ),
  constraint payment_receipts_amount_check check (amount_reported is null or amount_reported >= 0)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender_id uuid references public.users(id),
  message text not null,
  attachment_path text,
  visible_to_client boolean not null default true,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  note text not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  application_id uuid references public.applications(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_whatsapp_e164 on public.users (whatsapp_e164);
create index if not exists idx_users_role_status on public.users (role, status);
create index if not exists idx_whatsapp_otps_whatsapp_e164 on public.whatsapp_otps (whatsapp_e164);
create index if not exists idx_whatsapp_otps_expires_at on public.whatsapp_otps (expires_at);
create index if not exists idx_whatsapp_otps_consumed_at on public.whatsapp_otps (consumed_at);
create index if not exists idx_us_cities_state_id on public.us_cities (state_id);
create index if not exists idx_available_dates_date_status on public.available_dates (date, status);
create index if not exists idx_applications_client_id on public.applications (client_id);
create index if not exists idx_applications_assigned_user_id on public.applications (assigned_user_id);
create index if not exists idx_applications_status_stage on public.applications (status, current_stage);
create index if not exists idx_travelers_application_id on public.travelers (application_id);
create index if not exists idx_travelers_whatsapp_e164 on public.travelers (whatsapp_e164);
create index if not exists idx_receiving_contacts_application_id on public.receiving_contacts (application_id);
create index if not exists idx_mexico_requirements_application_id on public.traveler_mexico_entry_requirements (application_id);
create index if not exists idx_mexico_requirements_traveler_id on public.traveler_mexico_entry_requirements (traveler_id);
create index if not exists idx_documents_application_id on public.documents (application_id);
create index if not exists idx_documents_traveler_id on public.documents (traveler_id);
create index if not exists idx_documents_mexico_requirement_id on public.documents (mexico_requirement_id);
create index if not exists idx_timeline_events_application_id on public.timeline_events (application_id);
create index if not exists idx_payments_application_id on public.payments (application_id);
create index if not exists idx_payments_client_id on public.payments (client_id);
create index if not exists idx_payments_traveler_id on public.payments (traveler_id);
create index if not exists idx_payments_status_due_date on public.payments (status, due_date);
create index if not exists idx_payment_plan_items_application_id on public.payment_plan_items (application_id);
create index if not exists idx_payment_receipts_payment_id on public.payment_receipts (payment_id);
create index if not exists idx_payment_receipts_application_id on public.payment_receipts (application_id);
create index if not exists idx_messages_application_id on public.messages (application_id);
create index if not exists idx_internal_notes_application_id on public.internal_notes (application_id);
create index if not exists idx_activity_logs_user_id on public.activity_logs (user_id);
create index if not exists idx_activity_logs_application_id on public.activity_logs (application_id);
create index if not exists idx_activity_logs_entity on public.activity_logs (entity_type, entity_id);

drop trigger if exists set_updated_at_on_users on public.users;
create trigger set_updated_at_on_users
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_applications on public.applications;
create trigger set_updated_at_on_applications
before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_travelers on public.travelers;
create trigger set_updated_at_on_travelers
before update on public.travelers
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_receiving_contacts on public.receiving_contacts;
create trigger set_updated_at_on_receiving_contacts
before update on public.receiving_contacts
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_available_dates on public.available_dates;
create trigger set_updated_at_on_available_dates
before update on public.available_dates
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_mexico_entry_requirements on public.traveler_mexico_entry_requirements;
create trigger set_updated_at_on_mexico_entry_requirements
before update on public.traveler_mexico_entry_requirements
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_payments on public.payments;
create trigger set_updated_at_on_payments
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_payment_plan_items on public.payment_plan_items;
create trigger set_updated_at_on_payment_plan_items
before update on public.payment_plan_items
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
    and u.status = 'active'
  limit 1
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('owner', 'advisor', 'reviewer', 'support'), false)
$$;

create or replace function public.can_access_application(application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.applications a
    where a.id = application_id
      and (
        a.client_id = auth.uid()
        or a.assigned_user_id = auth.uid()
        or public.is_internal_user()
      )
  )
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.is_internal_user() from public;
revoke all on function public.can_access_application(uuid) from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_internal_user() to authenticated;
grant execute on function public.can_access_application(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.whatsapp_otps enable row level security;
alter table public.applications enable row level security;
alter table public.travelers enable row level security;
alter table public.receiving_contacts enable row level security;
alter table public.us_states enable row level security;
alter table public.us_cities enable row level security;
alter table public.available_dates enable row level security;
alter table public.traveler_mexico_entry_requirements enable row level security;
alter table public.documents enable row level security;
alter table public.timeline_events enable row level security;
alter table public.payments enable row level security;
alter table public.payment_plan_items enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.messages enable row level security;
alter table public.internal_notes enable row level security;
alter table public.activity_logs enable row level security;

create policy users_select_self_or_internal
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_internal_user());

create policy internal_manage_users
on public.users
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy internal_manage_whatsapp_otps
on public.whatsapp_otps
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy applications_select_own_or_internal
on public.applications
for select
to authenticated
using (client_id = auth.uid() or assigned_user_id = auth.uid() or public.is_internal_user());

create policy internal_manage_applications
on public.applications
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy travelers_select_by_application_access
on public.travelers
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_travelers
on public.travelers
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy receiving_contacts_select_by_application_access
on public.receiving_contacts
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_receiving_contacts
on public.receiving_contacts
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy us_states_select_active_authenticated
on public.us_states
for select
to authenticated
using (active = true or public.is_internal_user());

create policy internal_manage_us_states
on public.us_states
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy us_cities_select_active_authenticated
on public.us_cities
for select
to authenticated
using (active = true or public.is_internal_user());

create policy internal_manage_us_cities
on public.us_cities
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy available_dates_select_authenticated
on public.available_dates
for select
to authenticated
using (status in ('available', 'limited') or public.is_internal_user());

create policy internal_manage_available_dates
on public.available_dates
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy mexico_requirements_select_by_application_access
on public.traveler_mexico_entry_requirements
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_mexico_requirements
on public.traveler_mexico_entry_requirements
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy documents_select_by_application_access
on public.documents
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_documents
on public.documents
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy timeline_events_select_visible_by_application_access
on public.timeline_events
for select
to authenticated
using (visible_to_client = true and public.can_access_application(application_id));

create policy internal_manage_timeline_events
on public.timeline_events
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy payments_select_by_application_access
on public.payments
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_payments
on public.payments
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy payment_plan_items_select_by_application_access
on public.payment_plan_items
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_payment_plan_items
on public.payment_plan_items
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy payment_receipts_select_by_application_access
on public.payment_receipts
for select
to authenticated
using (public.can_access_application(application_id));

create policy internal_manage_payment_receipts
on public.payment_receipts
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy messages_select_visible_by_application_access
on public.messages
for select
to authenticated
using (visible_to_client = true and public.can_access_application(application_id));

create policy internal_manage_messages
on public.messages
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy internal_manage_internal_notes
on public.internal_notes
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

create policy internal_manage_activity_logs
on public.activity_logs
for all
to authenticated
using (public.is_internal_user())
with check (public.is_internal_user());

insert into storage.buckets (id, name, public)
values
  ('documents', 'documents', false),
  ('payment-receipts', 'payment-receipts', false),
  ('profile-files', 'profile-files', false)
on conflict (id) do update
set public = false;

create policy internal_manage_private_storage_objects
on storage.objects
for all
to authenticated
using (
  bucket_id in ('documents', 'payment-receipts', 'profile-files')
  and public.is_internal_user()
)
with check (
  bucket_id in ('documents', 'payment-receipts', 'profile-files')
  and public.is_internal_user()
);
