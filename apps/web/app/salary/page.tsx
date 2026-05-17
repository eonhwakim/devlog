'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

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
  topRepos: Array<{
    name: string
    language: string | null
    stars: number
    isPrivate: boolean
    commits: number
  }>
  monthlyActivity: Array<{ month: string; count: number }>
}

function Spinner() {
  return (
    <div className="flex items-center gap-2 text-indigo-500">
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span className="text-sm">Claude가 분석 중...</span>
    </div>
  )
}

function MarkdownContent({ text }: { text: string }) {
  // 간단한 마크다운 → HTML 변환
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="mt-6 mb-2 text-base font-semibold text-gray-800">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mt-8 mb-3 text-lg font-bold text-gray-900">
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm text-gray-700 leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(
        <p key={i} className="text-sm text-gray-700 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
  }

  return <div className="space-y-0.5">{elements}</div>
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function SalaryPage() {
  const [annualData, setAnnualData] = useState<AnnualData | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  // 연간 데이터 로드
  useEffect(() => {
    fetch('/api/github/annual')
      .then(r => {
        if (!r.ok) throw new Error('데이터 로드 실패')
        return r.json()
      })
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

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  if (error && !annualData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
            ← 대시보드로
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
              ← 대시보드
            </Link>
            <span className="text-gray-300">|</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900">연봉협상 모드</h1>
              <p className="text-xs text-gray-400">
                {annualData?.period.from} ~ {annualData?.period.to} · @{annualData?.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {done && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                PDF 저장
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {analyzing ? '분석 중...' : done ? '다시 분석' : 'Claude로 분석하기'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {/* 연간 통계 요약 카드 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 print:border-gray-400">
          <h2 className="mb-4 text-sm font-semibold text-gray-500">
            {new Date().getFullYear()}년 GitHub 활동 요약
          </h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {[
              { label: '총 기여', value: annualData?.stats.totalContributions.toLocaleString() ?? '-' },
              { label: '커밋', value: annualData?.stats.commits.toLocaleString() ?? '-' },
              { label: 'PR', value: annualData?.stats.prs.toLocaleString() ?? '-' },
              { label: '코드리뷰', value: annualData?.stats.reviews.toLocaleString() ?? '-' },
              { label: '이슈', value: annualData?.stats.issues.toLocaleString() ?? '-' },
              {
                label: '추가 라인',
                value: annualData ? `+${(annualData.stats.additions / 1000).toFixed(1)}K` : '-',
              },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-xl font-bold text-indigo-600">{item.value}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>

          {/* 언어 분포 */}
          {annualData && annualData.topLanguages.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {annualData.topLanguages.map(l => (
                <span key={l.lang} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {l.lang} · {l.commits}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Claude 분석 결과 */}
        {(report || analyzing) && (
          <div ref={reportRef} className="rounded-xl border border-gray-200 bg-white p-6 print:border-gray-400">
            <div className="mb-4 flex items-center justify-between print:hidden">
              <h2 className="text-sm font-semibold text-gray-500">AI 성과 분석 리포트</h2>
              {analyzing && <Spinner />}
            </div>
            <div className="print:block">
              <MarkdownContent text={report} />
            </div>
            {analyzing && (
              <span className="inline-block h-4 w-0.5 animate-pulse bg-indigo-400 align-middle" />
            )}
          </div>
        )}

        {/* 분석 전 안내 */}
        {!report && !analyzing && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
              <svg className="h-6 w-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 01-5.303 0l-.347-.347z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              위 데이터를 Claude가 분석해 연봉협상에 쓸 수 있는 성과 리포트를 생성합니다
            </p>
            <p className="mt-1 text-xs text-gray-400">
              분석에 약 20~40초가 소요됩니다
            </p>
            <button
              onClick={handleAnalyze}
              className="mt-4 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Claude로 분석하기
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}
      </main>

      {/* 프린트용 스타일 */}
      <style jsx global>{`
        @media print {
          header, .print\\:hidden { display: none !important; }
          body { font-size: 12px; }
        }
      `}</style>
    </div>
  )
}
