'use client';

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type {
  AppointmentStatus,
  MonthlyAppointmentStatusCount,
} from '@/app/lib/data';

type AppointmentStatusDonutChartProps = {
  total: number;
  statuses: MonthlyAppointmentStatusCount[];
};

const statusDetails: Record<
  AppointmentStatus,
  { label: string; color: string }
> = {
  booked: { label: 'Booked', color: '#3b82f6' },
  done: { label: 'Completed', color: '#22c55e' },
  no_show: { label: 'No-show', color: '#ef4444' },
};

export default function AppointmentStatusDonutChart({
  total,
  statuses,
}: AppointmentStatusDonutChartProps) {
  if (total === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-md bg-gray-50 px-4 text-center text-sm text-gray-500">
        No appointments scheduled for this month yet.
      </div>
    );
  }

  const chartData = statuses.map((status) => ({
    ...status,
    label: statusDetails[status.status].label,
    color: statusDetails[status.status].color,
  }));

  return (
    <div className="grid items-center gap-4 sm:grid-cols-2">
      <div className="relative h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData.filter((status) => status.count > 0)}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="white"
              strokeWidth={2}
            >
              {chartData
                .filter((status) => status.count > 0)
                .map((status) => (
                  <Cell key={status.status} fill={status.color} />
                ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} ${Number(value) === 1 ? 'appointment' : 'appointments'}`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">appointments</span>
        </div>
      </div>

      <ul className="space-y-4" aria-label="Appointment status counts">
        {chartData.map((status) => {
          const percentage = Math.round((status.count / total) * 100);
          return (
            <li
              key={status.status}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                {status.label}
              </span>
              <span className="text-sm text-gray-600">
                {status.count} ({percentage}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
