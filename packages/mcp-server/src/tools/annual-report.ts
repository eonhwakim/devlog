import { createGitHubClient } from '../github/client.js'
import { ANNUAL_REPORT_QUERY } from '../github/queries.js'
import { compactPR, type RawPR } from '../compactor/index.js'

interface AnnualReportResponse {
  user: {
    name: string | null
    login: string
    contributionsCollection: {
      totalCommitContributions: number
      totalPullRequestContributions: number
      totalPullRequestReviewContributions: number
      totalIssueContributions: number
      totalRepositoriesWithContributedCommits: number
      contributionCalendar: {
        totalContributions: number
        weeks: Array<{
          contributionDays: Array<{ contributionCount: number; date: string }>
        }>
      }
      commitContributionsByRepository: Array<{
        repository: { name: string; primaryLanguage: { name: string } | null }
        contributions: { totalCount: number }
      }>
      pullRequestContributions: {
        nodes: Array<{ pullRequest: RawPR }>
      }
    }
  }
}

export async function getAnnualReport(args: { username: string; year?: number }) {
  const { username, year = new Date().getFullYear() } = args
  const client = createGitHubClient()

  const from = new Date(`${year}-01-01T00:00:00Z`)
  const to = new Date(`${year}-12-31T23:59:59Z`)

  const data = await client<AnnualReportResponse>(ANNUAL_REPORT_QUERY, {
    username,
    from: from.toISOString(),
    to: to.toISOString(),
  })

  const { user } = data
  const c = user.contributionsCollection

  const prs = c.pullRequestContributions.nodes
    .map(n => n.pullRequest)
    .map(compactPR)
    .sort((a, b) => b.impactScore - a.impactScore)

  // 기여가 가장 많았던 달 찾기
  const monthlyContribs = Array(12).fill(0)
  c.contributionCalendar.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      const month = new Date(day.date).getMonth()
      monthlyContribs[month] += day.contributionCount
    })
  })
  const peakMonth = monthlyContribs.indexOf(Math.max(...monthlyContribs)) + 1

  // 언어 분포
  const langStats = new Map<string, number>()
  c.commitContributionsByRepository.forEach(r => {
    const lang = r.repository.primaryLanguage?.name ?? '기타'
    langStats.set(lang, (langStats.get(lang) ?? 0) + r.contributions.totalCount)
  })
  const topLangs = [...langStats.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const totalAdditions = prs.reduce((sum, pr) => sum + pr.additions, 0)
  const totalDeletions = prs.reduce((sum, pr) => sum + pr.deletions, 0)
  const mergedPRs = prs.filter(pr => pr.state === 'MERGED')

  const lines = [
    `# devlog 연간 리포트 — @${username} (${year}년)`,
    ``,
    `## 핵심 수치 (연봉협상 자료)`,
    `- 총 기여: ${c.contributionCalendar.totalContributions}회`,
    `- 커밋: ${c.totalCommitContributions}개`,
    `- PR: ${c.totalPullRequestContributions}개 (머지 ${mergedPRs.length}개)`,
    `- 코드 리뷰: ${c.totalPullRequestReviewContributions}개`,
    `- 이슈: ${c.totalIssueContributions}개`,
    `- 기여한 레포: ${c.totalRepositoriesWithContributedCommits}개`,
    `- 순 코드 변경: +${totalAdditions.toLocaleString()} / -${totalDeletions.toLocaleString()} 라인`,
    `- 가장 활발했던 달: ${peakMonth}월 (${monthlyContribs[peakMonth - 1]}회 기여)`,
    ``,
    `## 주요 언어/기술 스택`,
    ...topLangs.map(([lang, count]) => `- ${lang}: ${count} 커밋`),
    ``,
    `## 임팩트 상위 PR (Top 10)`,
  ]

  prs.slice(0, 10).forEach((pr, i) => {
    lines.push(
      `### ${i + 1}. ${pr.title} (${pr.repo})`,
      `- 상태: ${pr.state}${pr.mergedAt ? ` / 머지: ${pr.mergedAt}` : ''}`,
      `- 변경: +${pr.additions} / -${pr.deletions} (${pr.changedFiles}개 파일)`,
      `- 리뷰: ${pr.reviewCount}개 / 임팩트 점수: ${pr.impactScore}/100`,
      ``
    )
  })

  lines.push(
    `## 기여한 레포지토리 (커밋 순)`,
    ...c.commitContributionsByRepository.map(r =>
      `- ${r.repository.name}: ${r.contributions.totalCount} 커밋 (${r.repository.primaryLanguage?.name ?? '기타'})`
    ),
    ``,
    `---`,
    `*위 ${year}년 연간 데이터를 바탕으로:*`,
    `*1. 이 개발자의 올해 핵심 성과를 3~5문장으로 요약해줘 (연봉협상 면접 답변 스타일로)*`,
    `*2. 가장 임팩트 있었던 기술적 기여를 구체적으로 설명해줘*`,
    `*3. 성장한 부분과 내년에 더 발전시킬 수 있는 방향을 제안해줘*`
  )

  return {
    content: [{ type: 'text' as const, text: lines.join('\n') }],
  }
}
