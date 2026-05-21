import { createGitHubClient, resolveGitHubUsername } from '../github/client.js'
import { MONTHLY_LANG_QUERY } from '../github/queries.js'
import { normalizePositiveInteger } from './args.js'

interface MonthlyLangResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number
      commitContributionsByRepository: Array<{
        repository: { name: string; primaryLanguage: { name: string } | null }
        contributions: { totalCount: number }
      }>
    }
  }
}

interface MonthSnapshot {
  label: string        // "2026-04"
  totalCommits: number
  langStats: Map<string, number>  // 언어 → 커밋 수
}

async function fetchMonthStats(
  client: ReturnType<typeof import('../github/client.js').createGitHubClient>,
  username: string,
  year: number,
  month: number  // 0-indexed
): Promise<MonthSnapshot> {
  const from = new Date(year, month, 1)
  const to = new Date(year, month + 1, 0, 23, 59, 59)
  const label = `${year}-${String(month + 1).padStart(2, '0')}`

  const data = await client<MonthlyLangResponse>(MONTHLY_LANG_QUERY, {
    username,
    from: from.toISOString(),
    to: to.toISOString(),
  })

  const c = data.user.contributionsCollection
  const langStats = new Map<string, number>()

  c.commitContributionsByRepository.forEach(r => {
    const lang = r.repository.primaryLanguage?.name ?? '기타'
    langStats.set(lang, (langStats.get(lang) ?? 0) + r.contributions.totalCount)
  })

  return { label, totalCommits: c.totalCommitContributions, langStats }
}

function buildTrendBar(ratio: number, maxWidth = 12): string {
  const filled = Math.round(ratio * maxWidth)
  return '█'.repeat(filled) + '░'.repeat(maxWidth - filled)
}

export async function getTechStackTrend(args: { username?: string; months?: number }) {
  const { username } = args
  const months = normalizePositiveInteger(args.months, 6, { min: 1, max: 12 })
  const client = createGitHubClient()
  const resolvedUsername = await resolveGitHubUsername(client, username)

  // 현재 달부터 N개월 전까지 병렬 조회
  const now = new Date()
  const queries = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return fetchMonthStats(client, resolvedUsername, d.getFullYear(), d.getMonth())
  })

  const snapshots = (await Promise.all(queries)).reverse() // 오래된 달 → 최근 달 순

  // 언어별 총 커밋 합산 (상위 5개만)
  const langTotals = new Map<string, number>()
  snapshots.forEach(s =>
    s.langStats.forEach((count, lang) =>
      langTotals.set(lang, (langTotals.get(lang) ?? 0) + count)
    )
  )
  const topLangs = [...langTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)

  // 추이 계산 (최근 달 vs 첫 달)
  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]

  const lines = [
    `# devlog 기술 스택 트렌드 — @${resolvedUsername}`,
    `기간: ${snapshots[0].label} ~ ${snapshots[snapshots.length - 1].label} (${months}개월)`,
    ``,
    `## 월별 커밋 수`,
    ...snapshots.map(s => {
      const maxCommits = Math.max(...snapshots.map(x => x.totalCommits), 1)
      const bar = buildTrendBar(s.totalCommits / maxCommits)
      return `${s.label}  ${bar}  ${s.totalCommits}커밋`
    }),
    ``,
    `## 언어별 월간 분포 (상위 ${topLangs.length}개)`,
  ]

  topLangs.forEach(lang => {
    lines.push(``, `### ${lang}`)
    snapshots.forEach(s => {
      const count = s.langStats.get(lang) ?? 0
      const maxForLang = Math.max(...snapshots.map(x => x.langStats.get(lang) ?? 0), 1)
      const bar = buildTrendBar(count / maxForLang)
      lines.push(`${s.label}  ${bar}  ${count}커밋`)
    })
  })

  // 변화 감지
  lines.push(``, `## 주목할 변화`)
  topLangs.forEach(lang => {
    const firstCount = first.langStats.get(lang) ?? 0
    const lastCount = last.langStats.get(lang) ?? 0
    if (firstCount === 0 && lastCount > 0) {
      lines.push(`- **${lang}**: 새로 시작 🆕`)
    } else if (firstCount > 0 && lastCount === 0) {
      lines.push(`- **${lang}**: 최근 사용 없음`)
    } else if (firstCount > 0) {
      const change = Math.round(((lastCount - firstCount) / firstCount) * 100)
      const arrow = change > 0 ? '↑' : '↓'
      if (Math.abs(change) > 20) {
        lines.push(`- **${lang}**: ${arrow} ${Math.abs(change)}% 변화`)
      }
    }
  })

  lines.push(
    ``,
    `## 해석 주의`,
    `- 이 리포트의 언어 추이는 각 저장소의 대표 언어(primary language) 기준 추정치입니다.`,
    `- 하나의 저장소 안에서 여러 기술을 함께 쓴 경우 실제 체감 스택과 차이가 날 수 있습니다.`,
    ``,
    `---`,
    `*위 기술 스택 변화 데이터를 바탕으로:*`,
    `*1. 이 개발자의 기술 성장 방향과 패턴을 분석해줘*`,
    `*2. 특히 주목할 만한 변화와 그 의미를 해석해줘*`,
    `*3. 앞으로 강화하면 좋을 기술 방향을 제안해줘*`
  )

  return {
    content: [{ type: 'text' as const, text: lines.join('\n') }],
  }
}
