Hook: The Family Clinic Dashboard is a clinic operations dashboard for a small family practice.
Problem: Without one place to see patients and appointments, the owner cannot easily spot growth or missed-appointment patterns.
Walk: Sign in > create an appointment for a patient > edit it > review both charts > sign out.
Decision: I chose clinic-membership RLS and a security-invoker aggregate view because the app must show each clinic user's authorized rows in its charts.
Limits: Treatments and automated reminder messages are not implemented; next I will finish the production smoke checks, review database grants, and add Playwright coverage.
