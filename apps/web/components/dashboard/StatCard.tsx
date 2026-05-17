interface StatCardProps {
  className?: string
  label: string
  value: number
  unit?: string
  tone?: 'ocean' | 'mint' | 'violet' | 'sunset'
  description?: string
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function StatCard({
  className,
  label,
  value,
  unit = '개',
  tone = 'ocean',
  description,
}: StatCardProps) {
  const toneMap: Record<NonNullable<StatCardProps['tone']>, string> = {
    ocean: 'from-cyan-400/22 to-blue-500/6',
    mint: 'from-emerald-400/22 to-teal-500/6',
    violet: 'from-fuchsia-400/20 to-violet-500/8',
    sunset: 'from-orange-400/20 to-rose-500/8',
  }

  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden p-5',
        className,
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', toneMap[tone])} />
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--dashboard-muted)]">
          {label}
        </p>
        <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--dashboard-text)]">
        {value.toLocaleString()}
          {unit ? <span className="ml-1 text-base font-normal text-[var(--dashboard-soft)]">{unit}</span> : null}
        </p>
        {description ? (
          <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--dashboard-soft)]">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
