
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchPatientRegistrations } from '@/app/lib/data';
import PatientRegistrationsChart from './patient-registrations-chart';

export default async function RevenueChart() {
  const registrations = await fetchPatientRegistrations();

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Is the practice growing?
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="rounded-md bg-white p-4">
          <PatientRegistrationsChart data={registrations} />
        </div>

        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">
            New patients per month (count) — last 6 months
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          The clinic owner can use this trend to decide whether to open a
          second consulting day.
        </p>
      </div>
    </div>
  );
}
