
import { lusitana } from '@/app/ui/fonts';
import { fetchMonthlyAppointmentStatuses } from '@/app/lib/data';
import AppointmentStatusDonutChart from './appointment-status-donut-chart';

export default async function AppointmentStatusChart() {
  const data = await fetchMonthlyAppointmentStatuses();

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        What share of this month&apos;s appointments are no-shows?
      </h2>

      <div className="flex grow flex-col rounded-xl bg-gray-50 p-4">
        <div className="rounded-md bg-white p-4">
          <AppointmentStatusDonutChart
            total={data.total}
            statuses={data.statuses}
          />
        </div>
        <div className="pt-4">
          <p className="text-sm font-medium text-gray-700">
            {data.monthLabel}: {data.total === 0
              ? 'No appointments this month.'
              : `${Math.round(
                  ((data.statuses.find((status) => status.status === 'no_show')
                    ?.count ?? 0) /
                    data.total) *
                    100,
                )}% of appointments were no-shows.`}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            The clinic owner can use this share to decide whether reminder
            messages may be needed.
          </p>
        </div>
      </div>
    </div>
  );
}
