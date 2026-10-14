# Family Clinic Dashboard

A clinic dashboard built with Next.js and Supabase to help clinic staff manage patients and appointments.

## Chart One: New Patients per Month

- **Question:** Is the practice growing? How many new patients joined each month?
- **Who acts:** The clinic owner decides whether to open a second consulting day.
- **Chart shape:** Bar chart, one bar per month, covering the last six months.
- **Database view:** `public.patients_per_month`
- **View columns:** `month_start`, `label`, `new_patients`
- **Security:** The view uses `security_invoker = true` so queries respect the signed-in user's access policies on the underlying `patients` table.
- **Axes:** Month and new patients (count); the bar-chart y-axis starts at zero.
- **Empty state:** Explains when no registration data is available.
- **Decision context:** The clinic owner uses the trend to decide whether to open a second consulting day.
- **View SQL:** [`supabase/patients_per_month.sql`](./supabase/patients_per_month.sql)

## Chart Two: No-show Share This Month

- **Question:** What share of this month&apos;s appointments are no-shows?
- **Who acts:** The clinic owner decides whether reminder messages may be needed.
- **Chart shape:** Donut, with booked, completed, and no-show statuses.
- **Rows:** Appointment status and count, scoped by the signed-in user&apos;s RLS.
- **Window:** Current calendar month in `Africa/Johannesburg`.
- **Empty state:** Explains when there are no appointments this month.

## Appointments

- Appointments are read and written through the Supabase server client.
- Patient options are scoped by the signed-in user's clinic membership.
- Appointment times are interpreted and displayed in `Africa/Johannesburg`.
- Owners can delete appointments; clinic members can create and edit them.
- The live appointments table and patient foreign-key relationship already
  exist, with clinic-membership policies already installed in Supabase. The
  read-only audit queries in [`supabase/appointments_rls_audit.sql`](./supabase/appointments_rls_audit.sql)
  inspect RLS status, policies, and table-level grants; they do not change the
  database. Do not replace the live appointment policies with a generic policy
  migration. The current grants also need a separate least-privilege review:
  `anon` has broad table privileges, including `TRUNCATE`, on `appointments`
  and `clinic_members`. No live grants have been changed.

### Data preparation

- The `patients` table is protected by Row Level Security (RLS).
- Test patient records are seeded across the six-month period.
- The `patients_per_month` view returns six monthly rows, including months with zero new patients.
- The view has been tested through the app using two separate user accounts.

### Technology

- Next.js
- Supabase
- PostgreSQL

## Development

Run the application from the `nextjs-dashboard` directory using the project's package scripts.

```bash
npm run dev
```

The development server normally runs at `http://localhost:3000`.
