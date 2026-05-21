import {
  collectConnectionNodes,
  createGitHubClient,
  resolveGitHubUsername,
  type ContributionConnection,
} from '../github/client.js'
import { WEEKLY_SUMMARY_QUERY } from '../github/queries.js'
import { compactPR, type RawPR } from '../compactor/index.js'

interface WeeklySummaryResponse {
  user: {
    name: string | null
    login: string
    contributionsCollection: {
      totalCommitContributions: number
      totalPullRequestContributions: number
      totalPullRequestReviewContributions: number
      totalIssueContributions: number
      commitContributionsByRepository: Array<{
        repository: { name: string; primaryLanguage: { name: string } | null }
        contributions: { totalCount: number }
      }>
      pullRequestContributions: ContributionConnection<{ pullRequest: RawPR }>
    }
  }
}

export async function getWeeklySummary(args: { username?: string; repo?: string }) {
  const { username, repo } = args
  const client = createGitHubClient()
  const resolvedUsername = await resolveGitHubUsername(client, username)

  const now = new Date()
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const baseVariables = {
    username: resolvedUsername,
    from: from.toISOString(),
    to: now.toISOString(),
  }
  const data = await client<WeeklySummaryResponse>(WEEKLY_SUMMARY_QUERY, baseVariables)

  const { user } = data
  const c = user.contributionsCollection
  const prNodes = await collectConnectionNodes(
    pullRequestCursor =>
      client<WeeklySummaryResponse>(WEEKLY_SUMMARY_QUERY, { ...baseVariables, pullRequestCursor }),
    response => response.user.contributionsCollection.pullRequestContributions,
    data
  )

  const prs = prNodes
    .map(n => n.pullRequest)
    .filter(pr => !repo || pr.baseRepository?.name === repo)
    .map(compactPR)

  const repos = c.commitContributionsByRepository
    .filter(r => !repo || r.repository.name === repo)

  const lines = [
    `# devlog 주간 리포트 — @${resolvedUsername}`,
    `기간: ${from.toISOString().split('T')[0]} ~ ${now.toISOString().split('T')[0]}`,
    ``,
    `## 활동 수치`,
    `- 커밋: ${c.totalCommitContributions}개`,
    `- PR: ${c.totalPullRequestContributions}개`,
    `- 코드 리뷰: ${c.totalPullRequestReviewContributions}개`,
    `- 이슈: ${c.totalIssueContributions}개`,
    ...(repo ? [`- 참고: 위 활동 수치는 계정 전체 기준이며, 아래 PR/레포 목록만 ${repo}로 필터링되었습니다.`] : []),
    ``,
    `## PR 목록`,
  ]

  if (prs.length === 0) {
    lines.push('이번 주 PR 없음')
  } else {
    prs.forEach(pr => {
      lines.push(
        `### ${pr.title} (${pr.repo})`,
        `- 상태: ${pr.state}${pr.mergedAt ? ` / 머지일: ${pr.mergedAt}` : ''}`,
        `- 변경: +${pr.additions} / -${pr.deletions} (${pr.changedFiles}개 파일)`,
        `- 리뷰: ${pr.reviewCount}개 / 임팩트 점수: ${pr.impactScore}/100`,
        `- 커밋: ${pr.commitSubjects.join(' | ')}`,
        ...(pr.bodyKeywords.length > 0 ? [`- 키워드: ${pr.bodyKeywords.join(', ')}`] : []),
        ``
      )
    })
  }

  lines.push(`## 기여한 레포지토리`)
  repos.forEach(r => {
    const lang = r.repository.primaryLanguage?.name ?? '기타'
    lines.push(`- ${r.repository.name} (${r.contributions.totalCount} 커밋, ${lang})`)
  })

  lines.push(
    ``,
    `---`,
    `*위 데이터를 바탕으로 이번 주 개발 활동의 인사이트와 하이라이트를 한국어로 정리해줘.*`,
    `*특히 가장 임팩트 있었던 작업, 기술 스택 패턴, 다음 주 제안을 포함해줘.*`
  )

  return {
    content: [{ type: 'text' as const, text: lines.join('\n') }],
  }
}
