'use client'

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface WeeklyChartProps {
  data: Array<{ date: string; count: number }>
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const formatted = data.map(d => ({
    day: new Date(d.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    activity: d.count,
  }))

  return (
    <div>
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--dashboard-muted)]">
          Momentum
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">Recent contribution flow</h3>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} barCategoryGap="18%">
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--dashboard-soft)' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(14,18,32,0.92)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.72)' }}
          />
          <Bar dataKey="activity" fill="var(--dashboard-accent)" radius={[10, 10, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
