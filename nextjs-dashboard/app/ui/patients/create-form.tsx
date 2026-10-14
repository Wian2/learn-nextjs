'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createPatient, type EntityFormState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default function CreatePatientForm() {
  const initialState: EntityFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createPatient,
    initialState,
  );

  return (
    <form action={formAction} noValidate>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label
            htmlFor="full_name"
            className="mb-2 block text-sm font-medium"
          >
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            maxLength={150}
            placeholder="Enter patient's full name"
            aria-describedby="full-name-error"
            aria-invalid={Boolean(state.errors?.full_name?.length)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          <div id="full-name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.full_name?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            placeholder="Enter phone number"
            aria-describedby="phone-error"
            aria-invalid={Boolean(state.errors?.phone?.length)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          <div id="phone-error" aria-live="polite" aria-atomic="true">
            {state.errors?.phone?.map((error) => (
              <p className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="date_of_birth"
            className="mb-2 block text-sm font-medium"
          >
            Date of birth
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            aria-describedby="date-of-birth-error"
            aria-invalid={Boolean(state.errors?.date_of_birth?.length)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
          <div id="date-of-birth-error" aria-live="polite" aria-atomic="true">
            {state.errors?.date_of_birth?.map((error) => (
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
          href="/dashboard/patients"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Registering...' : 'Register patient'}
        </Button>
      </div>
    </form>
  );
}
