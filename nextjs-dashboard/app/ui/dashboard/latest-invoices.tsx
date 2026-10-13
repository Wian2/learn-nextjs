
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { createClient } from '@/lib/supabase/server';

export default async function LatestInvoices() {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfNextMonth = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
    1,
  );

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('status')
    .gte('starts_at', startOfMonth.toISOString())
    .lt('starts_at', startOfNextMonth.toISOString());

  if (error) {
    console.error('Failed to fetch appointment statuses:', error.message);
    throw new Error('Failed to fetch appointment statuses.');
  }

  const counts = {
    booked: 0,
    done: 0,
    no_show: 0,
  };

  for (const appointment of appointments ?? []) {
    counts[appointment.status as keyof typeof counts] += 1;
  }

  const total = appointments?.length ?? 0;

  const statuses = [
    { key: 'booked', label: 'Booked', count: counts.booked, color: 'bg-blue-500' },
    { key: 'done', label: 'Completed', count: counts.done, color: 'bg-green-500' },
    { key: 'no_show', label: 'No-show', count: counts.no_show, color: 'bg-red-500' },
  ];

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Appointment Status
      </h2>

      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="flex flex-col gap-6 rounded-md bg-white p-6">
          <div>
            <p className="text-sm text-gray-500">Appointments this month</p>
            <p className="text-3xl font-semibold">{total}</p>
          </div>

          {statuses.map((status) => {
            const percentage =
              total === 0 ? 0 : Math.round((status.count / total) * 100);

            return (
              <div key={status.key}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${status.color}`} />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {status.count} ({percentage}%)
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-3 rounded-full ${status.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {total === 0 && (
            <p className="text-sm text-gray-500">
              No appointments scheduled for this month yet.
            </p>
          )}
        </div>

        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
