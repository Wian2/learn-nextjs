
'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { updatePatient, type State } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default function EditPatientForm({
  patient,
}: {
  patient: {
    id: string;
    full_name: string;
    phone: string | null;
    date_of_birth: string | null;
  };
}) {
  const initialState: State = { message: null, errors: {} };
  const updatePatientWithId = updatePatient.bind(null, patient.id);
  const [state, formAction] = useActionState(
    updatePatientWithId,
    initialState,
  );

  return (
    <form action={formAction}>
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
            defaultValue={patient.full_name}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium"
          >
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            defaultValue={patient.phone ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
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
            defaultValue={patient.date_of_birth ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
          />
        </div>

        {state.message && (
          <p className="mt-2 text-sm text-red-600">{state.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/patients"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
