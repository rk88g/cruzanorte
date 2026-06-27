alter table public.payments
add column if not exists payment_method text not null default 'manual',
add column if not exists payment_provider text not null default 'none',
add column if not exists provider_reference text;

alter table public.payments
drop constraint if exists payments_method_check;

alter table public.payments
add constraint payments_method_check
check (payment_method in ('manual', 'mercadopago', 'stripe'));

alter table public.payments
drop constraint if exists payments_provider_check;

alter table public.payments
add constraint payments_provider_check
check (payment_provider in ('none', 'mercadopago', 'stripe'));
