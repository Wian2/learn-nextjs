
import Link from 'next/link';
import {
  fetchAppointments,
  fetchCurrentClinicRole,
} from '@/app/lib/data';
import { formatSA } from '@/app/lib/time';
import AppointmentDeleteButton from '@/app/ui/appointments/delete-button';

export default async function AppointmentsPage() {
  const [appointments, role] = await Promise.all([
    fetchAppointments(),
    fetchCurrentClinicRole(),
  ]);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your clinic&apos;s appointments.
          </p>
        </div>

        <Link
          href="/dashboard/appointments/create"
          className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400"
        >
          + Book appointment
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No appointments yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Book an appointment to see it listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Date and time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => {
                  const patient = Array.isArray(appointment.patients)
                    ? appointment.patients[0]
                    : appointment.patients;

                  return (
                    <tr key={appointment.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {patient?.full_name ?? 'Unknown patient'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {formatSA(appointment.starts_at)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Link
                          href={`/dashboard/appointments/${appointment.id}/edit`}
                          className="rounded-md border border-gray-200 px-3 py-2 font-medium text-blue-600 transition-colors hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        {role === 'owner' && (
                          <span className="ml-3">
                            <AppointmentDeleteButton id={appointment.id} />
                          </span>
                        )}
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
