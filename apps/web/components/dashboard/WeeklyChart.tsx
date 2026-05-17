'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WeeklyChartProps {
  data: Array<{ date: string; count: number }>
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const formatted = data.map(d => ({
    day: new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    기여: d.count,
  }))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-500">일별 기여 활동</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={formatted} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="기여" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
