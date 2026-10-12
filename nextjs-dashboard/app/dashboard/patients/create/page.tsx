
import Link from 'next/link';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { createPatient } from '@/app/lib/actions';

export default function CreatePatientPage() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Patients', href: '/dashboard/patients' },
          {
            label: 'Register Patient',
            href: '/dashboard/patients/create',
            active: true,
          },
        ]}
      />

      <form action={createPatient}>
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
              placeholder="Enter phone number"
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
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/patients"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white hover:bg-blue-400"
          >
            Register patient
          </button>
        </div>
      </form>
    </main>
  );
}
