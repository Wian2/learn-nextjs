
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
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />

          <YAxis
            allowDecimals={false}
            domain={[0, 'auto']}
            tickLine={false}
            axisLine={false}
            width={32}
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
