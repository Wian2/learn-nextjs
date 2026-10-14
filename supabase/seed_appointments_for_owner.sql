with candidate_patients as (
  select
    patients.id as patient_id,
    patients.user_id,
    patients.clinic_id,
    row_number() over (order by patients.created_at, patients.id) as row_number
  from public.patients as patients
  where patients.user_id = 'PASTE_USER_UID_HERE'::uuid
    and patients.clinic_id is not null
    and not exists (
      select 1
      from public.appointments as existing
      where existing.patient_id = patients.id
        and existing.clinic_id = patients.clinic_id
    )
),
seed_rows as (
  select
    candidate_patients.user_id,
    candidate_patients.clinic_id,
    candidate_patients.patient_id,
    (
      array['done', 'done', 'done', 'booked', 'no_show']
        ::public.appointment_status[]
    )[((candidate_patients.row_number - 1) % 5 + 1)::integer] as status,
    (
      date_trunc(
        'month',
        now() at time zone 'Africa/Johannesburg'
      )
      + make_interval(
        days => 1 + ((candidate_patients.row_number * 7) % 28)::integer,
        hours => 8 + ((candidate_patients.row_number - 1) % 9)::integer
      )
    ) at time zone 'Africa/Johannesburg' as starts_at
  from candidate_patients
)
insert into public.appointments (
  user_id,
  clinic_id,
  patient_id,
  starts_at,
  status
)
select
  user_id,
  clinic_id,
  patient_id,
  starts_at,
  status
from seed_rows
order by patient_id;
