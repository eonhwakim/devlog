interface PR {
  title: string
  repo: string
  state: string
  additions: number
  deletions: number
  mergedAt: string | null
}

export function PRList({ prs }: { prs: PR[] }) {
  if (prs.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--dashboard-muted)]">
            Pull requests
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">Recent shipping log</h3>
        </div>
        <p className="text-sm text-[var(--dashboard-soft)]">이번 주 PR이 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--dashboard-muted)]">
          Pull requests
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--dashboard-text)]">Recent shipping log</h3>
      </div>
      <ul className="space-y-3">
        {prs.map((pr, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4"
          >
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                pr.state === 'MERGED'
                  ? 'bg-fuchsia-400/14 text-fuchsia-200'
                  : pr.state === 'OPEN'
                    ? 'bg-emerald-400/14 text-emerald-200'
                    : 'bg-white/10 text-white/70'
              }`}
            >
              {pr.state === 'MERGED' ? 'Merged' : pr.state === 'OPEN' ? 'Open' : 'Closed'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--dashboard-text)]">{pr.title}</p>
              <p className="mt-1 text-xs text-[var(--dashboard-soft)]">
                {pr.repo} · +{pr.additions} / -{pr.deletions}
                {pr.mergedAt && ` · ${new Date(pr.mergedAt).toLocaleDateString('ko-KR')}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
