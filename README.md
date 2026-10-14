# Family Clinic Dashboard

## What it does

The Family Clinic Dashboard helps a small family practice manage patients and appointments. It gives the clinic owner a six-month patient-registration trend and this month's appointment no-show share, with row access controlled by Supabase.

## Live demo

- **Production dashboard:** [https://nextjs-dashboard-chi-flax-58.vercel.app/dashboard](https://nextjs-dashboard-chi-flax-58.vercel.app/dashboard) (redirects to login when signed out)
- **Demo login:** Use the designated demo account; share its email and password privately with the assessor. No credentials belong in this repository.

## Run locally

From the `nextjs-dashboard` directory:

```bash
pnpm install
pnpm dev
```

Set the required environment variables in an ignored local `.env` file before running: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `POSTGRES_URL`. Never commit their values. The development server runs at `http://localhost:3000`.

## Technology and why

- **Next.js (App Router):** server-rendered pages and Server Actions for the dashboard's CRUD workflows.
- **Supabase Auth and Postgres:** signed-in users, relational records, and row-level access policies.
- **Recharts:** responsive bar and donut charts using the existing chart library.

## Entities and charts

- `patients` is the parent entity. `appointments.patient_id` is a foreign key to `patients`.
- Appointment and patient list/create/edit/delete workflows use the Supabase server client. Clinic membership determines which clinic records and patient options a signed-in user can access.
- **Chart one:** “Is the practice growing? How many new patients joined each month?” A six-month bar chart backed by `public.patients_per_month`.
- **Chart two:** “What share of this month's appointments are no-shows?” A status donut backed by `public.appointments_per_status_this_month`, a `security_invoker` view.
- The proposal's third entity, `treatments`, is deferred from this release; Realtime, Storage, and the Tomorrow page are not part of the demo scope.

## Known limitations

- Treatments, messaging, Realtime, and file storage are not implemented for this release.
- The current authorization model is clinic-membership based, rather than the proposal's initial per-user `user_id`-only baseline.
- The recorded manual smoke checks cover the Preview comprehensively; the remaining production-only checks are listed below and must be completed before the demo.
- The Supabase grant audit raised privileges that warrant a separate review. No grant or RLS policy changes were made as part of this release.

## Production smoke test (14 Oct 2026)

Tick only after checking on the production URL, using the intended user.

- [x] 1. Production URL loads signed out and signed in; `/dashboard` redirects to login while signed out.
- [x] 2. User one signs in and reaches `/dashboard`.
- [ ] 3. User one creates, edits, and deletes a patient in production; the list updates each time. (Verified on Preview.)
- [x] 4. Appointment create, edit, and delete work in production for user two; their patient selector is scoped to their clinic.
- [x] 5. Both charts render real, RLS-scoped data for both users.
- [x] 6. User two sees only records permitted by clinic membership; a user-one appointment is not exposed.
- [ ] 7. User two opens a user-one patient's edit URL and gets not found. (The equivalent appointment edit URL returned 404.)
- [ ] 8. Empty patient and appointment create forms show useful field-level feedback and save nothing. (Appointment form verified in production; patient form verified on Preview.)
- [ ] 9. `/dashboard/nothing-here` shows the not-found page in production. (Verified on Preview.)
- [ ] 10. Sign out and browser Back do not reveal the dashboard; verify `.env.local` is not tracked; confirm the latest Production deployment is Ready.
- [ ] Record a 60–90 second backup demo of the production happy path.

## Freeze plan (approved 14 Oct 2026)

### Must ship

1. Auth and protected dashboard routes; checks 1, 2, 9, and 10.
2. Patient CRUD and cross-user access denial; checks 3, 6, and 7.
3. Appointment CRUD, clinic-scoped patient selector, and isolation; checks 4, 6, and 7.
4. Both real-data, RLS-scoped charts; check 5.
5. Useful empty-form validation; check 8.

### Cut from this release

- Treatments, the proposal's third entity.
- Realtime, Storage, and the Tomorrow page.

### Polish

- Refine empty-state/chart wording and keep this README current with final production test results.

For Supabase view definitions, seed guidance, and read-only policy audits, see the SQL files in [`supabase/`](./supabase/).

## Three next steps

1. Complete the remaining production-only smoke checks and record a backup demo.
2. Review and least-privilege the Supabase table grants without weakening the existing clinic-membership policies.
3. Revisit the treatments entity and add automated Playwright coverage after the demo.
