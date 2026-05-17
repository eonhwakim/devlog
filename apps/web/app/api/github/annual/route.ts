import { auth } from '@/auth'
import { graphql } from '@octokit/graphql'
import { NextResponse } from 'next/server'

const ANNUAL_QUERY = `
  query AnnualReport($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      name
      createdAt
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        restrictedContributionsCount
        commitContributionsByRepository(maxRepositories: 20) {
          repository {
            name
            description
            primaryLanguage { name }
            stargazerCount
            isPrivate
          }
          contributions { totalCount }
        }
        pullRequestContributions(first: 50) {
          totalCount
          nodes {
            pullRequest {
              title
              state
              additions
              deletions
              mergedAt
              baseRepository { name }
              reviews(first: 1) { totalCount }
            }
          }
        }
        pullRequestReviewContributions(first: 30) {
          totalCount
          nodes {
            pullRequestReview {
              state
              bodyText
              pullRequest {
                title
                baseRepository { name }
              }
            }
          }
        }
        issueContributions(first: 30) {
          totalCount
          nodes {
            issue {
              title
              state
              closedAt
              baseRepository: repository { name }
            }
          }
        }
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  })

  const now = new Date()
  const from = new Date(now.getFullYear(), 0, 1).toISOString() // 올해 1월 1일

  const data = await client<any>(ANNUAL_QUERY, {
    from,
    to: now.toISOString(),
  })

  const c = data.viewer.contributionsCollection

  // 언어별 커밋 집계
  const languageMap: Record<string, number> = {}
  for (const r of c.commitContributionsByRepository) {
    const lang = r.repository.primaryLanguage?.name ?? 'Unknown'
    languageMap[lang] = (languageMap[lang] ?? 0) + r.contributions.totalCount
  }
  const topLanguages = Object.entries(languageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([lang, commits]) => ({ lang, commits }))

  // PR 요약 (코드 변경량 포함)
  const prs = c.pullRequestContributions.nodes.map((n: any) => ({
    title: n.pullRequest.title,
    repo: n.pullRequest.baseRepository?.name ?? '',
    state: n.pullRequest.state,
    additions: n.pullRequest.additions,
    deletions: n.pullRequest.deletions,
    mergedAt: n.pullRequest.mergedAt,
  }))

  const totalAdditions = prs.reduce((s: number, p: any) => s + (p.additions ?? 0), 0)
  const totalDeletions = prs.reduce((s: number, p: any) => s + (p.deletions ?? 0), 0)

  // 기여한 레포 목록
  const topRepos = c.commitContributionsByRepository
    .sort((a: any, b: any) => b.contributions.totalCount - a.contributions.totalCount)
    .slice(0, 10)
    .map((r: any) => ({
      name: r.repository.name,
      description: r.repository.description,
      language: r.repository.primaryLanguage?.name ?? null,
      stars: r.repository.stargazerCount,
      isPrivate: r.repository.isPrivate,
      commits: r.contributions.totalCount,
    }))

  // 일별 활동 (월별 집계)
  const monthlyActivity: Record<string, number> = {}
  for (const week of c.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      const month = day.date.slice(0, 7) // YYYY-MM
      monthlyActivity[month] = (monthlyActivity[month] ?? 0) + day.contributionCount
    }
  }

  return NextResponse.json({
    username: data.viewer.login,
    name: data.viewer.name,
    period: {
      from: from.split('T')[0],
      to: now.toISOString().split('T')[0],
    },
    stats: {
      totalContributions: c.contributionCalendar.totalContributions,
      commits: c.totalCommitContributions,
      prs: c.totalPullRequestContributions,
      reviews: c.totalPullRequestReviewContributions,
      issues: c.totalIssueContributions,
      additions: totalAdditions,
      deletions: totalDeletions,
    },
    topLanguages,
    topRepos,
    recentPRs: prs.slice(0, 20),
    monthlyActivity: Object.entries(monthlyActivity)
      .sort()
      .map(([month, count]) => ({ month, count })),
  })
}
