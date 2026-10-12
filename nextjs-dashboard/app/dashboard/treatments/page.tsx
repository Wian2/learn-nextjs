
import { fetchTreatments } from '@/app/lib/data';
import Link from 'next/link';

export default async function TreatmentsPage() {
  let treatments;

  try {
    treatments = await fetchTreatments();
  } catch {
    return (
      <div className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Treatments
        </h1>
        <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          We couldn&apos;t load the treatment records. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      
<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      Treatments
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      View treatment procedures and fees recorded for your clinic&apos;s appointments.
    </p>
  </div>

  <Link
    href="/dashboard/treatments/create"
    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
  >
    + Record treatment
  </Link>
</div>


      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {treatments.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No treatments yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Treatment records will appear here once they have been added.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Procedure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Fee
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {treatments.map((treatment) => {
                  const appointment = Array.isArray(treatment.appointments)
                    ? treatment.appointments[0]
                    : treatment.appointments;

                  const patient = appointment
                    ? Array.isArray(appointment.patients)
                      ? appointment.patients[0]
                      : appointment.patients
                    : null;

                  return (
                    <tr key={treatment.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {treatment.procedure}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {patient?.full_name ?? 'Unknown patient'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {appointment?.starts_at
                          ? new Date(appointment.starts_at).toLocaleString(
                              'en-ZA',
                              {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              },
                            )
                          : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                          {appointment?.status?.replace('_', ' ') ?? '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {(treatment.fee_cents / 100).toLocaleString('en-ZA', {
                          style: 'currency',
                          currency: 'ZAR',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
