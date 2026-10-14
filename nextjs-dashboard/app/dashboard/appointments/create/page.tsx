import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import CreateAppointmentForm from '@/app/ui/appointments/create-form';
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
      <CreateAppointmentForm patients={patients} />
    </main>
  );
}
