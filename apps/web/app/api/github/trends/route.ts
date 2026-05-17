import { auth } from '@/auth'
import { graphql } from '@octokit/graphql'
import { NextResponse } from 'next/server'

const MONTHLY_QUERY = `
  query MonthlyLang($from: DateTime!, $to: DateTime!) {
    viewer {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        commitContributionsByRepository(maxRepositories: 20) {
          repository {
            name
            primaryLanguage { name }
          }
          contributions { totalCount }
        }
      }
    }
  }
`

async function fetchMonth(
  client: ReturnType<typeof graphql.defaults>,
  year: number,
  month: number // 0-indexed
) {
  const from = new Date(year, month, 1)
  const to = new Date(year, month + 1, 0, 23, 59, 59)
  const label = `${year}-${String(month + 1).padStart(2, '0')}`

  const data = await client<any>(MONTHLY_QUERY, {
    from: from.toISOString(),
    to: to.toISOString(),
  })

  const c = data.viewer.contributionsCollection
  const langStats: Record<string, number> = {}

  for (const r of c.commitContributionsByRepository) {
    const lang = r.repository.primaryLanguage?.name ?? '기타'
    langStats[lang] = (langStats[lang] ?? 0) + r.contributions.totalCount
  }

  return { label, totalCommits: c.totalCommitContributions, langStats }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const months = Math.min(parseInt(searchParams.get('months') ?? '6', 10), 12)

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  })

  const now = new Date()
  const queries = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return fetchMonth(client, d.getFullYear(), d.getMonth())
  })

  const snapshots = (await Promise.all(queries)).reverse()

  // 언어별 총 커밋 집계 → 상위 5개
  const langTotals: Record<string, number> = {}
  for (const snap of snapshots) {
    for (const [lang, count] of Object.entries(snap.langStats)) {
      langTotals[lang] = (langTotals[lang] ?? 0) + count
    }
  }
  const topLangs = Object.entries(langTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)

  // 변화 감지
  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]
  const changes: Array<{ lang: string; type: 'new' | 'gone' | 'up' | 'down'; percent?: number }> = []

  for (const lang of topLangs) {
    const firstCount = first.langStats[lang] ?? 0
    const lastCount = last.langStats[lang] ?? 0
    if (firstCount === 0 && lastCount > 0) {
      changes.push({ lang, type: 'new' })
    } else if (firstCount > 0 && lastCount === 0) {
      changes.push({ lang, type: 'gone' })
    } else if (firstCount > 0) {
      const pct = Math.round(((lastCount - firstCount) / firstCount) * 100)
      if (Math.abs(pct) > 20) {
        changes.push({ lang, type: pct > 0 ? 'up' : 'down', percent: Math.abs(pct) })
      }
    }
  }

  // 차트용 데이터: 월별 × 언어별 커밋 수
  const chartData = snapshots.map(snap => {
    const row: Record<string, number | string> = { month: snap.label, total: snap.totalCommits }
    for (const lang of topLangs) {
      row[lang] = snap.langStats[lang] ?? 0
    }
    return row
  })

  return NextResponse.json({
    months,
    topLangs,
    chartData,
    changes,
    summary: {
      totalCommits: snapshots.reduce((s, snap) => s + snap.totalCommits, 0),
      activeMonths: snapshots.filter(s => s.totalCommits > 0).length,
      dominantLang: topLangs[0] ?? null,
    },
  })
}
