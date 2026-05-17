interface StatCardProps {
  label: string
  value: number
  unit?: string
  color?: string
}

export function StatCard({ label, value, unit = '개', color = 'blue' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }

  return (
    <div className={`rounded-xl border-2 p-5 ${colorMap[color] ?? colorMap.blue}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">
        {value.toLocaleString()}
        <span className="ml-1 text-base font-normal">{unit}</span>
      </p>
    </div>
  )
}
