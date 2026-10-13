
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import EditPatientForm from '@/app/ui/patients/edit-form';
import DeletePatientButton from '@/app/ui/patients/delete-button';
import { fetchPatientById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await fetchPatientById(id);

  if (!patient) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Patients', href: '/dashboard/patients' },
          {
            label: 'Edit Patient',
            href: `/dashboard/patients/${id}/edit`,
            active: true,
          },
        ]}
      />

      <div className="mt-6">
        <EditPatientForm patient={patient} />

        <div className="mt-4 flex justify-end">
          <DeletePatientButton id={id} />
        </div>
      </div>
    </main>
  );
}
