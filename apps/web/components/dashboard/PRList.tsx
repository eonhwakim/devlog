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
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-500">이번 주 PR</h3>
        <p className="text-sm text-gray-400">이번 주 PR이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-500">이번 주 PR</h3>
      <ul className="space-y-3">
        {prs.map((pr, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                pr.state === 'MERGED'
                  ? 'bg-purple-100 text-purple-700'
                  : pr.state === 'OPEN'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {pr.state === 'MERGED' ? 'Merged' : pr.state === 'OPEN' ? 'Open' : 'Closed'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">{pr.title}</p>
              <p className="text-xs text-gray-400">
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
