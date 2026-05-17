'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Copy, Printer } from 'lucide-react'

interface AnnualData {
  username: string
  name: string
  period: { from: string; to: string }
  stats: {
    totalContributions: number
    commits: number
    prs: number
    reviews: number
    issues: number
    additions: number
    deletions: number
  }
  topLanguages: Array<{ lang: string; commits: number }>
  topRepos: Array<{ name: string; language: string | null; stars: number; isPrivate: boolean; commits: number }>
  monthlyActivity: Array<{ month: string; count: number }>
}

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="mt-6 mb-2 text-base font-bold text-[var(--dashboard-text)]">{line.slice(4)}</h3>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mt-8 mb-3 text-lg font-bold text-[var(--dashboard-text)]">{line.slice(3)}</h2>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm text-[var(--dashboard-soft)] leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(
        <p key={i} className="text-sm text-[var(--dashboard-soft)] leading-relaxed">{renderInline(line)}</p>
      )
    }
  }
  return <div className="space-y-0.5">{elements}</div>
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-bold text-[var(--dashboard-text)]">{part.slice(2, -2)}</strong>
      : part
  )
}

export default function SalaryPage() {
  const [annualData, setAnnualData] = useState<AnnualData | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/github/annual')
      .then(r => { if (!r.ok) throw new Error('데이터 로드 실패'); return r.json() })
      .then(setAnnualData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleAnalyze() {
    if (!annualData) return
    setAnalyzing(true)
    setReport('')
    setDone(false)
    setError('')
    try {
      const res = await fetch('/api/claude/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annualData),
      })
      if (!res.ok) throw new Error('분석 요청 실패')
      if (!res.body) throw new Error('응답 스트림 없음')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done: streamDone, value } = await reader.read()
        if (streamDone) break
        setReport(prev => prev + decoder.decode(value, { stream: true }))
      }
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="dashboard-shell dashboard-theme-toast min-h-screen">
      <div className="dashboard-noise" />
      <div className="dashboard-orb dashboard-orb-left" />
      <div className="dashboard-orb dashboard-orb-right" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/8 px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-[var(--dashboard-muted)] hover:text-[var(--dashboard-soft)] transition">
              ← 대시보드
            </Link>
            <span className="text-white/10">|</span>
            <div>
              <h1 className="text-base font-bold text-[var(--dashboard-text)]">연봉협상 모드</h1>
              {annualData && (
                <p className="text-xs text-[var(--dashboard-muted)]">
                  {annualData.period.from} ~ {annualData.period.to} · @{annualData.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {done && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-sm text-[var(--dashboard-soft)] hover:bg-white/14 transition"
              >
                <Printer className="h-3.5 w-3.5" /> PDF
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || loading}
              className="rounded-full bg-[var(--dashboard-accent)] px-4 py-1.5 text-sm font-bold text-black hover:opacity-90 disabled:opacity-50 transition"
            >
              {analyzing ? '분석 중...' : done ? '다시 분석' : 'Claude로 분석하기'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-6 py-8 space-y-5">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
          </div>
        )}

        {error && !annualData && (
          <div className="glass-panel p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm text-[var(--dashboard-accent)] hover:underline">
              ← 대시보드로
            </Link>
          </div>
        )}

        {annualData && !loading && (
          <>
            {/* 연간 통계 요약 */}
            <div className="glass-panel p-6">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                {new Date().getFullYear()}년 GitHub 활동 요약
              </p>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                {[
                  { label: '총 기여', value: annualData.stats.totalContributions.toLocaleString() },
                  { label: '커밋', value: annualData.stats.commits.toLocaleString() },
                  { label: 'PR', value: annualData.stats.prs.toLocaleString() },
                  { label: '코드리뷰', value: annualData.stats.reviews.toLocaleString() },
                  { label: '이슈', value: annualData.stats.issues.toLocaleString() },
                  { label: '추가 라인', value: `+${(annualData.stats.additions / 1000).toFixed(1)}K` },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <div className="text-2xl font-bold text-[var(--dashboard-accent)]">{item.value}</div>
                    <div className="text-xs text-[var(--dashboard-muted)]">{item.label}</div>
                  </div>
                ))}
              </div>

              {annualData.topLanguages.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {annualData.topLanguages.map(l => (
                    <span key={l.lang} className="rounded-full border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent)]">
                      {l.lang} · {l.commits}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Claude 분석 결과 */}
            {(report || analyzing) && (
              <div className="glass-panel p-6">
                <div className="mb-4 flex items-center justify-between print:hidden">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                    AI 성과 분석 리포트
                  </p>
                  {analyzing && (
                    <div className="flex items-center gap-2 text-[var(--dashboard-accent)]">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
                      <span className="text-xs">Claude가 분석 중...</span>
                    </div>
                  )}
                </div>
                <MarkdownContent text={report} />
                {analyzing && (
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-[var(--dashboard-accent)] align-middle ml-1" />
                )}
              </div>
            )}

            {/* 분석 전 안내 */}
            {!report && !analyzing && (
              <div className="glass-panel p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/10">
                  <svg className="h-6 w-6 text-[var(--dashboard-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--dashboard-text)]">
                  위 데이터를 Claude가 분석해 연봉협상에 쓸 수 있는 성과 리포트를 생성합니다
                </p>
                <p className="mt-1.5 text-xs text-[var(--dashboard-muted)]">분석에 약 20~40초가 소요됩니다</p>
                <button
                  onClick={handleAnalyze}
                  className="mt-5 rounded-full bg-[var(--dashboard-accent)] px-6 py-2 text-sm font-bold text-black hover:opacity-90 transition"
                >
                  Claude로 분석하기
                </button>
              </div>
            )}

            {error && <p className="text-center text-sm text-red-400">{error}</p>}
          </>
        )}
      </main>
    </div>
  )
}
