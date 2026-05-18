import { auth } from '@/auth'
import { graphql as githubGraphql } from '@octokit/graphql'
import { NextResponse } from 'next/server'

interface PersonalQuery {
  viewer: {
    login: string
    pullRequests: {
      nodes: Array<{
        title: string
        state: string
        createdAt: string
        mergedAt: string | null
        url: string
        body: string
        comments: { totalCount: number }
        reviews: {
          totalCount: number
          nodes: Array<{
            author: { login: string; avatarUrl: string } | null
          }>
        }
        baseRepository: { nameWithOwner: string } | null
      }>
    }
    repositories: {
      nodes: Array<{
        defaultBranchRef: {
          target: {
            history: {
              nodes: Array<{
                committedDate: string
                author: { user: { login: string } | null }
              }>
            }
          }
        } | null
      }>
    }
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = githubGraphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  })

  const PERSONAL_QUERY = `
    query PersonalWrapped {
      viewer {
        login
        pullRequests(first: 30, orderBy: { field: UPDATED_AT, direction: DESC }) {
          nodes {
            title
            state
            createdAt
            mergedAt
            url
            body
            comments { totalCount }
            reviews(first: 30) {
              totalCount
              nodes {
                author { login avatarUrl }
              }
            }
            baseRepository { nameWithOwner }
          }
        }
        repositories(first: 4, orderBy: { field: PUSHED_AT, direction: DESC }) {
          nodes {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 60) {
                    nodes {
                      committedDate
                      author {
                        user { login }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await client<PersonalQuery>(PERSONAL_QUERY)
    const { viewer } = data

    // ── Epic PR (올해의 대장정) ─────────────────────────────────────
    const prsWithEngagement = viewer.pullRequests.nodes.map(pr => ({
      ...pr,
      engagement: pr.comments.totalCount + pr.reviews.totalCount * 2,
    }))
    const epicPR = [...prsWithEngagement].sort((a, b) => b.engagement - a.engagement)[0] ?? null

    // ── 생체리듬 (Bio-rhythm) ──────────────────────────────────────
    // PR 생성 시각 기반 (viewer 본인 활동 시각)
    const commitsByHour = new Array(24).fill(0)

    // PR createAt으로 추가
    for (const pr of viewer.pullRequests.nodes) {
      const h = new Date(pr.createdAt).getUTCHours()
      commitsByHour[h]++
    }

    // 레포 커밋 타임스탬프로 보강
    for (const repo of viewer.repositories.nodes) {
      const history = repo.defaultBranchRef?.target?.history?.nodes ?? []
      for (const commit of history) {
        if (commit.author.user?.login === viewer.login) {
          const h = new Date(commit.committedDate).getUTCHours()
          commitsByHour[h]++
        }
      }
    }

    // 4개 시간대로 집계
    const night   = commitsByHour.slice(22).reduce((a,b)=>a+b,0) + commitsByHour.slice(0,6).reduce((a,b)=>a+b,0)
    const morning = commitsByHour.slice(6,12).reduce((a,b)=>a+b,0)
    const afternoon = commitsByHour.slice(12,18).reduce((a,b)=>a+b,0)
    const evening = commitsByHour.slice(18,22).reduce((a,b)=>a+b,0)
    const total = night + morning + afternoon + evening || 1

    type BioRhythm = 'night-owl' | 'morning-bird' | 'afternoon-peak' | 'evening-surge' | 'consistent'
    let bioRhythmType: BioRhythm
    const maxVal = Math.max(night, morning, afternoon, evening)
    if (night === maxVal && night / total > 0.28)         bioRhythmType = 'night-owl'
    else if (morning === maxVal && morning / total > 0.28) bioRhythmType = 'morning-bird'
    else if (afternoon === maxVal)                          bioRhythmType = 'afternoon-peak'
    else if (evening === maxVal && evening / total > 0.28) bioRhythmType = 'evening-surge'
    else                                                    bioRhythmType = 'consistent'

    const peakHour = commitsByHour.indexOf(Math.max(...commitsByHour))

    // ── 소울메이트 ────────────────────────────────────────────────
    const reviewerMap = new Map<string, { count: number; avatarUrl: string }>()
    for (const pr of viewer.pullRequests.nodes) {
      for (const review of pr.reviews.nodes) {
        if (!review.author || review.author.login === viewer.login) continue
        const prev = reviewerMap.get(review.author.login)
        reviewerMap.set(review.author.login, {
          count: (prev?.count ?? 0) + 1,
          avatarUrl: review.author.avatarUrl,
        })
      }
    }
    const topReviewer = [...reviewerMap.entries()].sort((a, b) => b[1].count - a[1].count)[0]
    const soulmate = topReviewer
      ? { login: topReviewer[0], avatarUrl: topReviewer[1].avatarUrl, reviewCount: topReviewer[1].count }
      : null

    return NextResponse.json({
      epicPR: epicPR ? {
        title: epicPR.title,
        repo: epicPR.baseRepository?.nameWithOwner ?? '',
        commentCount: epicPR.comments.totalCount,
        reviewCount: epicPR.reviews.totalCount,
        engagement: epicPR.engagement,
        mergedAt: epicPR.mergedAt,
        state: epicPR.state,
        url: epicPR.url,
        bodyPreview: epicPR.body.slice(0, 180).replace(/\n/g, ' '),
      } : null,
      commitsByHour,
      bioRhythmType,
      bioRhythmStats: {
        nightPct:     Math.round(night / total * 100),
        morningPct:   Math.round(morning / total * 100),
        afternoonPct: Math.round(afternoon / total * 100),
        eveningPct:   Math.round(evening / total * 100),
        peakHour,
      },
      soulmate,
    })
  } catch (e: any) {
    console.error('[personal API]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
