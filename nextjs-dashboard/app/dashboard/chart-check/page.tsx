
import { createClient } from '@/lib/supabase/server'

export default async function ChartCheckPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, created_at')
    .order('created_at', { ascending: true })

  const { data: monthlyData, error: viewError } = await supabase
    .from('patients_per_month')
    .select('month_start, label, new_patients')
    .order('month_start', { ascending: true })

  return (
    <pre className="p-4 text-sm whitespace-pre-wrap">
      {JSON.stringify(
        {
          signedInUserId: user?.id,
          patientCount: patients?.length ?? null,
          patientsError: patientsError?.message ?? null,
          patientDates: patients?.map((p) => p.created_at) ?? null,
          monthlyData,
          viewError: viewError?.message ?? null,
        },
        null,
        2,
      )}
    </pre>
  )
}
