
import { createClient } from '@/lib/supabase/server';
import { lusitana } from '@/app/ui/fonts';

export default async function TomorrowPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const startOfFollowingDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 2,
  );

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      status,
      patients (
        full_name,
        phone
      )
    `)
    .eq('status', 'booked')
    .gte('starts_at', startOfTomorrow.toISOString())
    .lt('starts_at', startOfFollowingDay.toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch tomorrow appointments:', error.message);

    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Tomorrow's Appointments
        </h1>
        <p className="text-red-600">
          Could not load appointments. Please try again.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-2 text-xl md:text-2xl`}>
        Tomorrow's Appointments
      </h1>

      <p className="mb-6 text-sm text-gray-500">
        Booked appointments for{' '}
        {startOfTomorrow.toLocaleDateString('en-ZA', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      {!appointments || appointments.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-6 text-gray-600">
          No booked appointments for tomorrow.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-gray-50 p-4">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const patient = Array.isArray(appointment.patients)
                  ? appointment.patients[0]
                  : appointment.patients;

                return (
                  <tr
                    key={appointment.id}
                    className="border-b border-gray-200 last:border-0"
                  >
                    <td className="px-4 py-4">
                      {new Date(appointment.starts_at).toLocaleTimeString(
                        'en-ZA',
                        { hour: '2-digit', minute: '2-digit' },
                      )}
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {patient?.full_name ?? 'Unknown patient'}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {patient?.phone || 'No phone number'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
