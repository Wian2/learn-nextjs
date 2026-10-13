
import { CalendarIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchPatientRegistrations } from '@/app/lib/data';

export default async function RevenueChart() {
  const registrations = await fetchPatientRegistrations();
  const chartHeight = 300;
  const topLabel = Math.max(
    1,
    ...registrations.map((month) => month.registrations),
  );

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Patient Registrations
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="grid grid-cols-6 items-end gap-3 rounded-md bg-white p-4 sm:gap-4">
          {registrations.map((month) => (
            <div
              key={`${month.year}-${month.month}`}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-sm font-medium text-gray-700">
                {month.registrations}
              </span>

              <div
                className="flex w-full items-end rounded-md bg-blue-100"
                style={{ height: `${chartHeight}px` }}
              >
                <div
                  className="w-full rounded-md bg-blue-500"
                  style={{
                    height: `${
                      (chartHeight / topLabel) * month.registrations
                    }px`,
                    minHeight:
                      month.registrations > 0 ? '4px' : '0px',
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 sm:text-sm">
                {month.month}
              </p>
              <p className="text-xs text-gray-400">{month.year}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">
            Last 6 months
          </h3>
        </div>
      </div>
    </div>
  );
}
