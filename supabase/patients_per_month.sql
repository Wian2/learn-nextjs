create or replace view public.patients_per_month
with (security_invoker = true) as
with months as (
  select generate_series(
    date_trunc('month', now()) - interval '5 months',
    date_trunc('month', now()),
    interval '1 month'
  ) as month_start
)
select
  m.month_start,
  to_char(m.month_start, 'Mon YYYY') as label,
  count(p.id)::int as new_patients
from months m
left join public.patients p
  on p.created_at >= m.month_start
  and p.created_at < m.month_start + interval '1 month'
group by m.month_start
order by m.month_start;

grant select on public.patients_per_month to authenticated;
