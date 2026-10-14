-- Read-only audit queries for the live clinic-membership RLS setup.
-- These statements inspect the database; they do not create or change policies.

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('appointments', 'patients', 'clinic_members')
  and c.relkind = 'r'
order by c.relname;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('appointments', 'patients', 'clinic_members')
order by tablename, policyname;

select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('appointments', 'patients', 'clinic_members')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;
