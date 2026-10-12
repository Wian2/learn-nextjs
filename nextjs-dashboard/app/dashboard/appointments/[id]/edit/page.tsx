
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { updateAppointment } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .select('id, patient_id, starts_at, status')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch appointment:', error.message);
    throw new Error('Could not load this appointment.');
  }

  if (!appointment) {
    notFound();
  }

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, full_name')
    .order('full_name', { ascending: true });

  if (patientsError) {
    console.error('Failed to fetch patients:', patientsError.message);
    throw new Error('Could not load the patient list.');
  }

  const localDateTime = new Date(
    appointment.starts_at,
  ).toLocaleString('sv-SE', {
    timeZone: 'Africa/Johannesburg',
  }).replace(' ', 'T').slice(0, 16);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: 'Appointments',
            href: '/dashboard/appointments',
          },
          {
            label: 'Edit appointment',
            href: `/dashboard/appointments/${id}/edit`,
            active: true,
          },
        ]}
      />

      <form action={updateAppointment.bind(null, id)}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          <div className="mb-4">
            <label
              htmlFor="patient_id"
              className="mb-2 block text-sm font-medium"
            >
              Patient
            </label>
            <select
              id="patient_id"
              name="patient_id"
              defaultValue={appointment.patient_id}
              required
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="starts_at"
              className="mb-2 block text-sm font-medium"
            >
              Date and time
            </label>
            <input
              id="starts_at"
              name="starts_at"
              type="datetime-local"
              defaultValue={localDateTime}
              required
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
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
              defaultValue={appointment.status}
              required
              className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm"
            >
              <option value="booked">Booked</option>
              <option value="done">Done</option>
              <option value="no_show">No-show</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard/appointments"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 hover:bg-gray-200"
            >
              Cancel
            </Link>
            <Button type="submit">Save changes</Button>
          </div>
        </div>
      </form>
    </main>
  );
}
