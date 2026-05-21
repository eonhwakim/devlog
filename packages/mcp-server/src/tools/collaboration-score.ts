import { createGitHubClient, resolveGitHubUsername } from '../github/client.js'
import { COLLABORATION_SCORE_QUERY } from '../github/queries.js'
import { normalizePositiveInteger } from './args.js'

interface ReviewContribution {
  pullRequestReview: {
    body: string | null
    state: string
    comments: { nodes: Array<{ body: string }> }
  }
}

interface PRContribution {
  pullRequest: {
    title: string
    body: string | null
    commits: { nodes: Array<{ commit: { message: string } }> }
  }
}

interface CollaborationResponse {
  user: {
    login: string
    contributionsCollection: {
      totalPullRequestContributions: number
      totalPullRequestReviewContributions: number
      pullRequestContributions: { nodes: PRContribution[] }
      pullRequestReviewContributions: { nodes: ReviewContribution[] }
    }
  }
}

function scorePRBodies(prs: PRContribution[]): { score: number; detail: string } {
  if (prs.length === 0) return { score: 15, detail: 'PR 없음 (기본값)' }

  const scores = prs.map(({ pullRequest: pr }) => {
    const body = pr.body ?? ''
    let s = 0
    if (body.length > 50)  s += 8   // 최소한의 설명 있음
    if (body.length > 200) s += 7   // 상세 설명
    if (/#{1,3}\s/.test(body))  s += 5  // 구조화 (## 헤더)
    if (/why|이유|배경|motivation|because/i.test(body)) s += 5  // 이유 설명
    if (/- \[[ x]\]/i.test(body)) s += 5 // 체크리스트
    return Math.min(30, s)
  })

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const hasStructure = prs.filter(p => /#{1,3}\s/.test(p.pullRequest.body ?? '')).length
  return {
    score: Math.round(avg),
    detail: `${prs.length}개 PR 분석 / 구조화된 PR: ${hasStructure}개`,
  }
}

function scoreCommitMessages(prs: PRContribution[]): { score: number; detail: string } {
  const allMessages = prs.flatMap(p =>
    p.pullRequest.commits.nodes.map(n => n.commit.message.split('\n')[0].trim())
  )
  if (allMessages.length === 0) return { score: 15, detail: '커밋 없음 (기본값)' }

  const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?:/
  const conventionalCount = allMessages.filter(m => conventionalPattern.test(m)).length
  const conventionalRatio = conventionalCount / allMessages.length

  const avgLen = allMessages.reduce((s, m) => s + m.length, 0) / allMessages.length
  const lengthScore = Math.min(10, Math.floor(avgLen / 5)) // 50자 이상이면 만점

  const score = Math.round(conventionalRatio * 20 + lengthScore)
  return {
    score: Math.min(30, score),
    detail: `${allMessages.length}개 커밋 / Conventional: ${conventionalCount}개 (${Math.round(conventionalRatio * 100)}%) / 평균 길이: ${Math.round(avgLen)}자`,
  }
}

function scoreReviews(
  reviews: ReviewContribution[],
  totalPRs: number
): { participation: number; quality: number; detail: string } {
  const participationScore = Math.min(20, Math.round((reviews.length / Math.max(totalPRs, 1)) * 20))

  if (reviews.length === 0) {
    return { participation: participationScore, quality: 10, detail: '리뷰 없음' }
  }

  const qualityScores = reviews.map(({ pullRequestReview: r }) => {
    const body = (r.body ?? '') + r.comments.nodes.map(c => c.body).join(' ')
    let s = 0
    if (body.length > 30) s += 5   // 내용 있는 리뷰
    if (body.includes('?')) s += 5  // 질문형 (강요 아닌 제안)
    if (/suggest|consider|어떨까|좋을|생각|혹시|어떤가/i.test(body)) s += 5  // 협력적 어조
    if (body.length > 100) s += 5  // 상세 리뷰
    return Math.min(20, s)
  })

  const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
  return {
    participation: participationScore,
    quality: Math.round(avgQuality),
    detail: `${reviews.length}개 리뷰 / PR 대비 리뷰 비율: ${Math.round((reviews.length / Math.max(totalPRs, 1)) * 100)}%`,
  }
}

export async function getCollaborationScore(args: { username?: string; weeks?: number }) {
  const { username } = args
  const weeks = normalizePositiveInteger(args.weeks, 4, { min: 1, max: 26 })
  const client = createGitHubClient()
  const resolvedUsername = await resolveGitHubUsername(client, username)

  const to = new Date()
  const from = new Date(to.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)

  const data = await client<CollaborationResponse>(COLLABORATION_SCORE_QUERY, {
    username: resolvedUsername,
    from: from.toISOString(),
    to: to.toISOString(),
  })

  const c = data.user.contributionsCollection
  const prs = c.pullRequestContributions.nodes
  const reviews = c.pullRequestReviewContributions.nodes

  const prBody = scorePRBodies(prs)
  const commit = scoreCommitMessages(prs)
  const review = scoreReviews(reviews, c.totalPullRequestContributions)

  const total = prBody.score + commit.score + review.participation + review.quality

  const lines = [
    `# devlog 협업 지표 — @${resolvedUsername}`,
    `기간: ${from.toISOString().split('T')[0]} ~ ${to.toISOString().split('T')[0]} (${weeks}주)`,
    ``,
    `## 종합 점수: ${total} / 100`,
    ``,
    `| 항목 | 점수 | 만점 | 세부 내용 |`,
    `|---|---|---|---|`,
    `| PR 본문 명확성 | ${prBody.score} | 30 | ${prBody.detail} |`,
    `| 커밋 메시지 가독성 | ${commit.score} | 30 | ${commit.detail} |`,
    `| 리뷰 참여도 | ${review.participation} | 20 | ${review.detail} |`,
    `| 리뷰 품질 | ${review.quality} | 20 | 어조 및 내용 분석 |`,
    ``,
    `## 원시 데이터`,
    `- 총 PR: ${c.totalPullRequestContributions}개`,
    `- 총 리뷰: ${c.totalPullRequestReviewContributions}개`,
    ``,
    `---`,
    `*위 데이터를 바탕으로:*`,
    `*1. 이 개발자의 협업 스타일을 3~4문장으로 평가해줘*`,
    `*2. 가장 잘 하고 있는 부분과 개선할 수 있는 부분을 구체적으로 말해줘*`,
    `*3. 동료 개발자 관점에서 함께 일하면 어떨지 한 줄로 표현해줘*`,
  ]

  return {
    content: [{ type: 'text' as const, text: lines.join('\n') }],
  }
}
