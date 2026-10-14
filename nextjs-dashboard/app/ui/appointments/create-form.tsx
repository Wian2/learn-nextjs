'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import {
  createAppointment,
  type EntityFormState,
} from '@/app/lib/actions';
import type { PatientOption } from '@/app/lib/data';
import { Button } from '@/app/ui/button';

export default function CreateAppointmentForm({
  patients,
}: {
  patients: PatientOption[];
}) {
  const initialState: EntityFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createAppointment,
    initialState,
  );

  return (
    <form action={formAction} noValidate>
      <div className="mt-6 rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label
            htmlFor="patient_id"
            className="mb-2 block text-sm font-medium"
          >
            Select patient
          </label>
          <select
            id="patient_id"
            name="patient_id"
            required
            defaultValue=""
            aria-describedby="patient-id-error"
            aria-invalid={Boolean(state.errors?.patient_id?.length)}
            className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm"
          >
            <option value="" disabled>
              Choose a patient
            </option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
          <div id="patient-id-error" aria-live="polite" aria-atomic="true">
            {state.errors?.patient_id?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
          {patients.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Register a patient before booking an appointment.
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="starts_at"
            className="mb-2 block text-sm font-medium"
          >
            Appointment date and time
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            aria-describedby="starts-at-error"
            aria-invalid={Boolean(state.errors?.starts_at?.length)}
            className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm"
          />
          <div id="starts-at-error" aria-live="polite" aria-atomic="true">
            {state.errors?.starts_at?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="status" className="mb-2 block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="booked"
            required
            aria-describedby="status-error"
            aria-invalid={Boolean(state.errors?.status?.length)}
            className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm"
          >
            <option value="booked">Booked</option>
            <option value="done">Completed</option>
            <option value="no_show">No-show</option>
          </select>
          <div id="status-error" aria-live="polite" aria-atomic="true">
            {state.errors?.status?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        {state.message && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {state.message}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/appointments"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={patients.length === 0 || isPending}>
          {isPending ? 'Booking...' : 'Book appointment'}
        </Button>
      </div>
    </form>
  );
}
