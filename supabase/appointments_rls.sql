-- Clinic-membership RLS for the existing appointments table.
-- Review against the live policies before running: this replaces every
-- existing policy on public.appointments.

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
  loop
    execute format(
      'drop policy %I on public.appointments',
      existing_policy.policyname
    );
  end loop;
end
$$;

alter table public.appointments enable row level security;

revoke all on table public.appointments from anon, authenticated;
grant select, insert, delete on table public.appointments to authenticated;
grant update (patient_id, starts_at, status)
  on table public.appointments to authenticated;

create index if not exists appointments_clinic_id_idx
  on public.appointments (clinic_id);

create index if not exists appointments_patient_id_idx
  on public.appointments (patient_id);

create policy "appointments: clinic members can select"
  on public.appointments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clinic_members cm
      where cm.clinic_id = appointments.clinic_id
        and cm.user_id = (select auth.uid())
    )
  );

create policy "appointments: clinic members can insert"
  on public.appointments
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.clinic_members cm
      where cm.clinic_id = appointments.clinic_id
        and cm.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.patients p
      where p.id = appointments.patient_id
        and p.clinic_id = appointments.clinic_id
    )
  );

create policy "appointments: clinic members can update"
  on public.appointments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.clinic_members cm
      where cm.clinic_id = appointments.clinic_id
        and cm.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.clinic_members cm
      where cm.clinic_id = appointments.clinic_id
        and cm.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.patients p
      where p.id = appointments.patient_id
        and p.clinic_id = appointments.clinic_id
    )
  );

create policy "appointments: owners can delete"
  on public.appointments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.clinic_members cm
      where cm.clinic_id = appointments.clinic_id
        and cm.user_id = (select auth.uid())
        and cm.role = 'owner'
    )
  );
