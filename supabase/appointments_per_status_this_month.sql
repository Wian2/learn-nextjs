create or replace view public.appointments_per_status_this_month
with (security_invoker = true) as
with month_window as (
  select date_trunc(
    'month',
    now() at time zone 'Africa/Johannesburg'
  ) as local_month_start
),
statuses(status) as (
  values ('booked'), ('done'), ('no_show')
)
select
  month_window.local_month_start as month_start,
  to_char(month_window.local_month_start, 'FMMonth YYYY') as month_label,
  statuses.status,
  count(appointments.id)::integer as appointment_count
from month_window
cross join statuses
left join public.appointments as appointments
  on appointments.status::text = statuses.status
  and appointments.starts_at >= (
    month_window.local_month_start
    at time zone 'Africa/Johannesburg'
  )
  and appointments.starts_at < (
    (month_window.local_month_start + interval '1 month')
    at time zone 'Africa/Johannesburg'
  )
group by month_window.local_month_start, statuses.status
order by statuses.status;

revoke all on table public.appointments_per_status_this_month from anon;
grant select on table public.appointments_per_status_this_month to authenticated;
