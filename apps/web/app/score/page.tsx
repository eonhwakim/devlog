'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Category {
  key: string
  label: string
  score: number
  max: number
  detail: string
  description: string
}

interface ScoreData {
  username: string
  period: { from: string; to: string; weeks: number }
  total: number
  maxTotal: number
  categories: Category[]
  rawStats: { totalPRs: number; totalReviews: number }
}

const WEEKS_OPTIONS = [2, 4, 8, 12]

const GRADE_MAP = [
  { min: 85, label: 'S', color: '#fbbf24', textClass: 'text-yellow-400' },
  { min: 70, label: 'A', color: 'var(--dashboard-accent)', textClass: 'text-[var(--dashboard-accent)]' },
  { min: 55, label: 'B', color: '#34d399', textClass: 'text-emerald-400' },
  { min: 40, label: 'C', color: '#fb923c', textClass: 'text-orange-400' },
  { min: 0,  label: 'D', color: '#f87171', textClass: 'text-red-400' },
]

function getGrade(score: number) {
  return GRADE_MAP.find(g => score >= g.min) ?? GRADE_MAP[GRADE_MAP.length - 1]
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const grade = getGrade(score)
  const pct = score / max
  const r = 52
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - pct)

  return (
    <div className="relative flex items-center justify-center">
      <svg width={136} height={136} className="-rotate-90">
        <circle cx={68} cy={68} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} />
        <motion.circle
          cx={68} cy={68} r={r}
          fill="none"
          stroke={grade.color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${grade.color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className={`text-3xl font-black ${grade.textClass}`}>{score}</div>
        <div className="text-xs text-[var(--dashboard-muted)]">/ {max}</div>
      </div>
    </div>
  )
}

function CategoryBar({ cat }: { cat: Category }) {
  const pct = (cat.score / cat.max) * 100
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[var(--dashboard-text)]">{cat.label}</span>
          <span className="ml-2 text-xs text-[var(--dashboard-muted)]">{cat.description}</span>
        </div>
        <span className="text-sm font-bold text-[var(--dashboard-text)]">
          {cat.score} <span className="text-[var(--dashboard-muted)] font-normal">/ {cat.max}</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10">
        <motion.div
          className="h-1.5 rounded-full bg-[var(--dashboard-accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 8px var(--dashboard-accent)' }}
        />
      </div>
      <p className="mt-1 text-xs text-[var(--dashboard-muted)]">{cat.detail}</p>
    </div>
  )
}

export default function ScorePage() {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weeks, setWeeks] = useState(4)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/github/score?weeks=${weeks}`)
      .then(r => { if (!r.ok) throw new Error('데이터 로드 실패'); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [weeks])

  const grade = data ? getGrade(data.total) : null

  return (
    <div className="dashboard-shell dashboard-theme-toast min-h-screen">
      <div className="dashboard-noise" />
      <div className="dashboard-orb dashboard-orb-left" />
      <div className="dashboard-orb dashboard-orb-right" />

      <header className="relative z-10 border-b border-white/8 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-[var(--dashboard-muted)] hover:text-[var(--dashboard-soft)] transition">
              ← 대시보드
            </Link>
            <span className="text-white/10">|</span>
            <div>
              <h1 className="text-base font-bold text-[var(--dashboard-text)]">협업 점수</h1>
              {data && (
                <p className="text-xs text-[var(--dashboard-muted)]">
                  {data.period.from} ~ {data.period.to} · @{data.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/12 bg-white/8 p-1">
            {WEEKS_OPTIONS.map(w => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  weeks === w
                    ? 'bg-[var(--dashboard-accent)] text-black'
                    : 'text-[var(--dashboard-soft)] hover:text-[var(--dashboard-text)]'
                }`}
              >
                {w}주
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl px-6 py-8 space-y-5">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
          </div>
        )}

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        {data && !loading && (
          <>
            {/* 종합 점수 카드 */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-8">
                <ScoreRing score={data.total} max={data.maxTotal} />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-black ${grade!.textClass}`}>{grade!.label}</span>
                    <span className="text-lg text-[var(--dashboard-muted)]">등급</span>
                  </div>
                  <p className="mt-1.5 text-sm text-[var(--dashboard-soft)]">
                    {data.period.weeks}주 동안 PR {data.rawStats.totalPRs}개, 리뷰 {data.rawStats.totalReviews}개
                  </p>
                  <p className="mt-3 text-xs text-[var(--dashboard-muted)]">
                    PR 본문 · 커밋 메시지 · 리뷰 참여도 · 리뷰 품질 4개 지표 기반
                  </p>
                </div>
              </div>
            </div>

            {/* 카테고리별 점수 */}
            <div className="glass-panel p-6 space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                항목별 점수
              </p>
              {data.categories.map(cat => (
                <CategoryBar key={cat.key} cat={cat} />
              ))}
            </div>

            {/* 등급 가이드 */}
            <div className="glass-panel p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                점수 해석
              </p>
              <div className="flex flex-wrap gap-2">
                {GRADE_MAP.map((g, i) => (
                  <span key={g.label} className={`rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold ${g.textClass}`}>
                    {g.label} {g.min}점{i > 0 ? `~${GRADE_MAP[i - 1].min - 1}점` : '+'}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--dashboard-muted)]">
                기간이 짧으면 데이터가 부족해 낮게 나올 수 있어요. 4주 이상을 권장합니다.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
