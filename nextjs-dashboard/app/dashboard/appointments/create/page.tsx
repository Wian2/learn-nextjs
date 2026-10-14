
import Link from 'next/link';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { createAppointment } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import { fetchPatientOptions } from '@/app/lib/data';

export default async function CreateAppointmentPage() {
  const patients = await fetchPatientOptions();

  return (
    <main className="w-full">
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Appointments',
            href: '/dashboard/appointments',
          },
          {
            label: 'Book appointment',
            href: '/dashboard/appointments/create',
            active: true,
          },
        ]}
      />

      <form action={createAppointment}>
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
              className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue="booked"
              required
              className="block w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm"
            >
              <option value="booked">Booked</option>
              <option value="done">Done</option>
              <option value="no_show">No-show</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/dashboard/appointments"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={patients.length === 0}>
            Book appointment
          </Button>
        </div>
      </form>
    </main>
  );
}
