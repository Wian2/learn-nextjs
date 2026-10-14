
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type RegistrationMonth = {
  month_start: string;
  label: string;
  new_patients: number;
};

type PatientRegistrationsChartProps = {
  data: RegistrationMonth[];
};

export default function PatientRegistrationsChart({
  data,
}: PatientRegistrationsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-md bg-gray-50 px-4 text-center text-sm text-gray-500">
        No patient registration data is available for the last six months.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 4, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="label"
            height={42}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            label={{
              value: 'Month',
              position: 'insideBottom',
              offset: -4,
              style: { fontSize: 12 },
            }}
          />

          <YAxis
            allowDecimals={false}
            domain={[0, 'auto']}
            tickLine={false}
            axisLine={false}
            width={52}
            label={{
              value: 'New patients (count)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12 },
            }}
          />

          <Tooltip
            formatter={(value) => [value, 'New patients']}
            labelFormatter={(label) => `Month: ${label}`}
          />

          <Bar
            dataKey="new_patients"
            name="New patients"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
