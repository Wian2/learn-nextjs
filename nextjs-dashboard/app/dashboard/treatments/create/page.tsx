
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { createTreatment } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default async function CreateTreatmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      status,
      patients (full_name)
    `)
    .order('starts_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch appointments:', error.message);

    return (
      <div className="w-full">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Record treatment
        </h1>
        <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          We couldn&apos;t load the appointments. Please try again.
        </p>
      </div>
    );
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Treatments',
            href: '/dashboard/treatments',
          },
          {
            label: 'Record treatment',
            href: '/dashboard/treatments/create',
            active: true,
          },
        ]}
      />

      <form action={createTreatment}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <div className="mb-4">
            <label
              htmlFor="appointment_id"
              className="mb-2 block text-sm font-medium"
            >
              Appointment
            </label>

            <select
              id="appointment_id"
              name="appointment_id"
              defaultValue=""
              required
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="" disabled>
                Choose an appointment
              </option>

              {appointments.map((appointment) => {
                const patient = Array.isArray(appointment.patients)
                  ? appointment.patients[0]
                  : appointment.patients;

                return (
                  <option key={appointment.id} value={appointment.id}>
                    {patient?.full_name ?? 'Unknown patient'} —{' '}
                    {new Date(appointment.starts_at).toLocaleString(
                      'en-ZA',
                      {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      },
                    )}{' '}
                    ({appointment.status.replace('_', ' ')})
                  </option>
                );
              })}
            </select>

            {appointments.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Book an appointment before recording a treatment.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="procedure"
              className="mb-2 block text-sm font-medium"
            >
              Procedure
            </label>
            <input
              id="procedure"
              name="procedure"
              type="text"
              maxLength={200}
              placeholder="e.g. General consultation"
              required
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="fee"
              className="mb-2 block text-sm font-medium"
            >
              Fee (R)
            </label>
            <input
              id="fee"
              name="fee"
              type="number"
              min="0"
              step="0.01"
              placeholder="450.00"
              required
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/treatments"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </Link>

            <Button type="submit" disabled={appointments.length === 0}>
              Save treatment
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
