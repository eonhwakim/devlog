import { auth } from '@/auth'
import { graphql } from '@octokit/graphql'
import { NextResponse } from 'next/server'

const SCORE_QUERY = `
  query CollaborationScore($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      contributionsCollection(from: $from, to: $to) {
        totalPullRequestContributions
        totalPullRequestReviewContributions
        pullRequestContributions(first: 30) {
          nodes {
            pullRequest {
              title
              body
              commits(first: 30) {
                nodes {
                  commit { message }
                }
              }
            }
          }
        }
        pullRequestReviewContributions(first: 30) {
          nodes {
            pullRequestReview {
              body
              state
              comments(first: 5) {
                nodes { body }
              }
            }
          }
        }
      }
    }
  }
`

function scorePRBodies(prs: any[]) {
  if (prs.length === 0) return { score: 15, detail: 'PR 없음 (기본값)', items: [] }

  const items = prs.map(({ pullRequest: pr }) => {
    const body = pr.body ?? ''
    let s = 0
    if (body.length > 50) s += 8
    if (body.length > 200) s += 7
    if (/#{1,3}\s/.test(body)) s += 5
    if (/why|이유|배경|motivation|because/i.test(body)) s += 5
    if (/- \[[ x]\]/i.test(body)) s += 5
    return { title: pr.title, score: Math.min(30, s) }
  })

  const avg = items.reduce((a, b) => a + b.score, 0) / items.length
  const structured = prs.filter(p => /#{1,3}\s/.test(p.pullRequest.body ?? '')).length
  return {
    score: Math.round(avg),
    detail: `${prs.length}개 PR · 구조화된 PR ${structured}개`,
    items,
  }
}

function scoreCommitMessages(prs: any[]) {
  const allMessages = prs.flatMap((p: any) =>
    p.pullRequest.commits.nodes.map((n: any) => n.commit.message.split('\n')[0].trim())
  )
  if (allMessages.length === 0) return { score: 15, detail: '커밋 없음 (기본값)', conventionalRatio: 0 }

  const pattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?:/
  const conventionalCount = allMessages.filter((m: string) => pattern.test(m)).length
  const conventionalRatio = conventionalCount / allMessages.length
  const avgLen = allMessages.reduce((s: number, m: string) => s + m.length, 0) / allMessages.length
  const lengthScore = Math.min(10, Math.floor(avgLen / 5))
  const score = Math.min(30, Math.round(conventionalRatio * 20 + lengthScore))

  return {
    score,
    detail: `${allMessages.length}개 커밋 · Conventional ${Math.round(conventionalRatio * 100)}% · 평균 ${Math.round(avgLen)}자`,
    conventionalRatio,
    avgLen: Math.round(avgLen),
  }
}

function scoreReviews(reviews: any[], totalPRs: number) {
  const participationScore = Math.min(20, Math.round((reviews.length / Math.max(totalPRs, 1)) * 20))

  if (reviews.length === 0) {
    return { participation: participationScore, quality: 10, detail: '리뷰 없음' }
  }

  const qualityScores = reviews.map(({ pullRequestReview: r }) => {
    const body = (r.body ?? '') + r.comments.nodes.map((c: any) => c.body).join(' ')
    let s = 0
    if (body.length > 30) s += 5
    if (body.includes('?')) s += 5
    if (/suggest|consider|어떨까|좋을|생각|혹시|어떤가/i.test(body)) s += 5
    if (body.length > 100) s += 5
    return Math.min(20, s)
  })

  const avgQuality = qualityScores.reduce((a: number, b: number) => a + b, 0) / qualityScores.length

  return {
    participation: participationScore,
    quality: Math.round(avgQuality),
    detail: `${reviews.length}개 리뷰 · PR 대비 ${Math.round((reviews.length / Math.max(totalPRs, 1)) * 100)}%`,
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const weeks = parseInt(searchParams.get('weeks') ?? '4', 10)

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  })

  const now = new Date()
  const from = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)

  const data = await client<any>(SCORE_QUERY, {
    from: from.toISOString(),
    to: now.toISOString(),
  })

  const c = data.viewer.contributionsCollection
  const prs = c.pullRequestContributions.nodes
  const reviews = c.pullRequestReviewContributions.nodes

  const prBody = scorePRBodies(prs)
  const commit = scoreCommitMessages(prs)
  const review = scoreReviews(reviews, c.totalPullRequestContributions)

  const total = prBody.score + commit.score + review.participation + review.quality

  return NextResponse.json({
    username: data.viewer.login,
    period: {
      from: from.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
      weeks,
    },
    total,
    maxTotal: 100,
    categories: [
      {
        key: 'prBody',
        label: 'PR 본문 명확성',
        score: prBody.score,
        max: 30,
        detail: prBody.detail,
        description: 'PR 설명의 구조화, 이유 서술, 체크리스트 활용도',
      },
      {
        key: 'commit',
        label: '커밋 메시지 가독성',
        score: commit.score,
        max: 30,
        detail: commit.detail,
        description: 'Conventional Commits 준수율 및 메시지 평균 길이',
      },
      {
        key: 'reviewParticipation',
        label: '리뷰 참여도',
        score: review.participation,
        max: 20,
        detail: review.detail,
        description: 'PR 수 대비 코드 리뷰 참여 비율',
      },
      {
        key: 'reviewQuality',
        label: '리뷰 품질',
        score: review.quality,
        max: 20,
        detail: '어조 및 내용 분석',
        description: '협력적 어조, 질문형 리뷰, 충분한 설명 여부',
      },
    ],
    rawStats: {
      totalPRs: c.totalPullRequestContributions,
      totalReviews: c.totalPullRequestReviewContributions,
    },
  })
}
