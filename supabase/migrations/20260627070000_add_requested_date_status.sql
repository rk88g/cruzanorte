alter table public.applications
add column if not exists requested_date_status text not null default 'none',
add column if not exists requested_date_notes text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'applications_requested_date_status_check'
  ) then
    alter table public.applications
    add constraint applications_requested_date_status_check
    check (requested_date_status in ('none', 'requested', 'approved', 'rejected', 'cancelled'));
  end if;
end;
$$;

update public.applications
set requested_date_status = case
  when approved_date_id is not null then 'approved'
  when requested_date_id is not null then 'requested'
  else requested_date_status
end
where requested_date_status = 'none';
