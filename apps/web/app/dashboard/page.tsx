import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/dashboard/StatCard'
import { WeeklyChart } from '@/components/dashboard/WeeklyChart'
import { PRList } from '@/components/dashboard/PRList'

async function getWeeklyData(accessToken: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/github/weekly`, {
    headers: { Cookie: `next-auth.session-token=${accessToken}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/')

  // 서버 컴포넌트에서 직접 API 호출 (자기 자신 fetch 대신 직접 import 방식)
  const { graphql } = await import('@octokit/graphql')

  const WEEKLY_QUERY = `
    query WeeklySummary($from: DateTime!, $to: DateTime!) {
      viewer {
        name
        login
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
          commitContributionsByRepository(maxRepositories: 8) {
            repository {
              name
              primaryLanguage { name }
            }
            contributions { totalCount }
          }
          pullRequestContributions(first: 10) {
            nodes {
              pullRequest {
                title
                state
                additions
                deletions
                mergedAt
                baseRepository { name }
              }
            }
          }
        }
      }
    }
  `

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  })

  const now = new Date()
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const data = await client<any>(WEEKLY_QUERY, {
    from: from.toISOString(),
    to: now.toISOString(),
  })

  const c = data.viewer.contributionsCollection
  const dailyActivity = c.contributionCalendar.weeks
    .flatMap((w: any) => w.contributionDays)
    .slice(-7)

  const recentPRs = c.pullRequestContributions.nodes.map((n: any) => ({
    title: n.pullRequest.title,
    repo: n.pullRequest.baseRepository?.name ?? '',
    state: n.pullRequest.state,
    additions: n.pullRequest.additions,
    deletions: n.pullRequest.deletions,
    mergedAt: n.pullRequest.mergedAt,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">devlog</h1>
            <p className="text-sm text-gray-500">
              {from.toLocaleDateString('ko-KR')} ~ {now.toLocaleDateString('ko-KR')} 주간 리포트
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">@{data.viewer.login}</span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <button type="submit" className="text-sm text-gray-400 hover:text-gray-600">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="커밋" value={c.totalCommitContributions} color="blue" />
          <StatCard label="PR" value={c.totalPullRequestContributions} color="purple" />
          <StatCard label="코드 리뷰" value={c.totalPullRequestReviewContributions} color="green" />
          <StatCard label="이슈" value={c.totalIssueContributions} color="orange" />
        </div>

        {/* 일별 차트 */}
        <WeeklyChart data={dailyActivity} />

        {/* 레포 + PR */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 기여 레포 */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-500">기여한 레포지토리</h3>
            {c.commitContributionsByRepository.length === 0 ? (
              <p className="text-sm text-gray-400">이번 주 커밋 없음</p>
            ) : (
              <ul className="space-y-2">
                {c.commitContributionsByRepository.map((r: any) => (
                  <li key={r.repository.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{r.repository.name}</span>
                    <div className="flex items-center gap-2">
                      {r.repository.primaryLanguage && (
                        <span className="text-xs text-gray-400">{r.repository.primaryLanguage.name}</span>
                      )}
                      <span className="text-sm font-semibold text-indigo-600">
                        {r.contributions.totalCount}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* PR 목록 */}
          <PRList prs={recentPRs} />
        </div>
      </main>
    </div>
  )
}
