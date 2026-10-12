
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function PatientsPage() {
  const supabase = await createClient();

  const { data: patients, error } = await supabase
    .from('patients')
    .select('id, full_name, phone, date_of_birth, created_at')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Failed to fetch patients:', error.message);

    return (
      <div className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Patients
        </h1>
        <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          We couldn&apos;t load the patient records. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      
<div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      Patients
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      View and manage your clinic&apos;s patient records.
    </p>
  </div>

  <Link
    href="/dashboard/patients/create"
    className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400"
  >
    + Register patient
  </Link>
</div>


      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {patients.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No patients yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Patient records will appear here once they have been registered.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Full name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Date of birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {patient.full_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {patient.phone || '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {patient.date_of_birth
                        ? new Date(
                            `${patient.date_of_birth}T00:00:00`,
                          ).toLocaleDateString('en-ZA')
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Link
                            href={`/dashboard/patients/${patient.id}/edit`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                        >
                            Edit
                        </Link>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
