import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import CreatePatientForm from '@/app/ui/patients/create-form';

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
      <CreatePatientForm />
    </main>
  );
}
