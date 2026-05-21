import { extractKeywords } from './extract-keywords.js'

export interface RawPR {
  title: string
  body?: string | null
  state: string
  additions: number
  deletions: number
  changedFiles: number
  mergedAt: string | null
  baseRepository: { name: string } | null
  reviews: { totalCount: number }
  commits: { nodes: Array<{ commit: { message: string } }> }
}

export interface CompactedPR {
  title: string
  repo: string
  state: string
  mergedAt: string | null
  additions: number
  deletions: number
  changedFiles: number
  reviewCount: number
  commitSubjects: string[]   // 커밋 메시지 첫 줄만, diff 원문 제거
  bodyKeywords: string[]
  impactScore: number        // 단순 휴리스틱: 변경량 + 리뷰 수
}

export function compactPR(raw: RawPR): CompactedPR {
  const commitSubjects = raw.commits.nodes
    .map(n => n.commit.message.split('\n')[0].trim())
    .filter(Boolean)
    .slice(0, 10)

  // 임팩트 점수: 변경량, 파일 범위, 리뷰 참여, 실제 머지 여부를 함께 반영
  const changeScore = Math.min(45, Math.floor((raw.additions + raw.deletions) / 120) * 8)
  const fileScopeScore = Math.min(20, raw.changedFiles * 2)
  const reviewScore = Math.min(40, raw.reviews.totalCount * 8)
  const mergeBonus = raw.state === 'MERGED' ? 8 : 0
  const impactScore = Math.min(100, changeScore + fileScopeScore + reviewScore + mergeBonus)
  const bodyKeywords = extractKeywords(raw.body ?? '')

  return {
    title: raw.title,
    repo: raw.baseRepository?.name ?? 'unknown',
    state: raw.state,
    mergedAt: raw.mergedAt ? raw.mergedAt.split('T')[0] : null,
    additions: raw.additions,
    deletions: raw.deletions,
    changedFiles: raw.changedFiles,
    reviewCount: raw.reviews.totalCount,
    commitSubjects,
    bodyKeywords,
    impactScore,
  }
}
