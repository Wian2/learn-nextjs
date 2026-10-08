Family Clinic Dashboard

Deployed base: https://nextjs-dashboard-chi-flax-58.vercel.app/ 
Repository: https://github.com/Wian2/learn-nextjs 
Student: Wian Brits



1. Domain
The Family Clinic Dashboard is a small dashboard for a family practice with one owner and two front-desk staff.

The owner uses the dashboard each Monday to:

decide whether the practice needs an additional consulting day; and
monitor missed appointments and decide whether reminder messages may be needed.
The application will use authenticated users and Supabase Row Level Security (RLS) to ensure that users can only access the records they are authorised to see or change.



2. Entities
The application will contain exactly three entities.

Entity          Replaces	Fields
patients	    customers	id: uuid, user_id: uuid, full_name: text, phone: text, date_of_birth: date, created_at: timestamptz
appointments	invoices	id: uuid, user_id: uuid, patient_id: uuid (FK to patients), starts_at: timestamptz, status: enum(booked, done, no_show), created_at: timestamptz
treatments	    revenue	    id: uuid, user_id: uuid, appointment_id: uuid (FK to appointments), procedure: text, fee_cents: integer, created_at: timestamptz


Entity relationships

The entities form a simple parent-child structure:

patients
   │
   └── appointments
          │
          └── treatments

patients is the parent entity, so it will be built first.

Each capstone entity includes:

id — the row's unique identifier;
user_id — the authenticated user who owns the row; and
created_at — when the row was created.



3. Charts
The dashboard will contain exactly two charts.

#   Question it answers	                                                Who acts on the answer	                                    Chart type	                    Data needed
1	Is the practice growing? How many new patients joined each month?	The owner decides whether to open a second consulting day.	Bar chart — one bar per month	Count of patients by created_at, covering the last 6 months.
2	What share of this month's appointments are no-shows?	            The owner decides whether reminder messages may be needed.	Donut chart                     This month's appointments, joined to patients and counted by status.


Build order
Chart 1 can be answered using the patients table alone.

Therefore:

patients is the first entity to build.



4. Roles
The application has two roles.

Role	    Can see	                    Can change
Owner	    Everything	                Everything
Front desk	Patients and appointments	Create and edit patients and appointments; cannot delete records or modify treatments

These role definitions will eventually be reflected in the application's authorisation and Supabase RLS policies.

For the first RLS implementation, the baseline rule is that an authenticated user can access only rows where user_id matches their authenticated user ID.



5. Stretch
A "Tomorrow" page showing booked appointments for the following day, including each patient's phone number.

6. Out of Scope
The following features are intentionally excluded from the project:

Online booking by patients
Sending messages or reminders
Medical aid claims
Support for more than one practice
A mobile application