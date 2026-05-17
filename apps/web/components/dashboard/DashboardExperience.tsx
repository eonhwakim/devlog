'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { WrappedExperience } from './WrappedExperience'
import {
  Activity,
  ArrowRight,
  Copy,
  Flame,
  GitPullRequest,
  MessageSquareMore,
  Share2,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Mode = 'toast' | 'personal'

interface DashboardExperienceProps {
  viewer: { login: string; name: string | null }
  periodLabel: string
  stats: { commits: number; prs: number; reviews: number; issues: number }
  dailyActivity: Array<{ date: string; count: number }>
  recentPRs: Array<{
    title: string; repo: string; state: string
    additions: number; deletions: number; mergedAt: string | null
  }>
  topRepos: Array<{ name: string; language: string | null; commits: number }>
  persona: {
    title: string; headline: string; aura: string
    stats: Array<{ label: string; value: string }>
    toastCopy: string; roastCopy: string
  }
}

interface ScoreMini {
  total: number
  categories: Array<{ key: string; label: string; score: number; max: number }>
}

interface TrendsMini {
  topLangs: string[]
  summary: { totalCommits: number; dominantLang: string | null }
  chartData: Array<Record<string, number | string>>
}

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

function buildTechStack(topRepos: DashboardExperienceProps['topRepos']) {
  const map = new Map<string, number>()
  topRepos.forEach(r => {
    const l = r.language ?? 'Unknown'
    map.set(l, (map.get(l) ?? 0) + r.commits)
  })
  const result = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }))
  return result.length > 0 ? result : [
    { name: 'TypeScript', value: 88 }, { name: 'JavaScript', value: 46 }, { name: 'Python', value: 18 },
  ]
}

const GRADE_MAP = [
  { min: 85, label: 'S', color: '#fbbf24' },
  { min: 70, label: 'A', color: 'var(--dashboard-accent)' },
  { min: 55, label: 'B', color: '#34d399' },
  { min: 40, label: 'C', color: '#fb923c' },
  { min: 0,  label: 'D', color: '#f87171' },
]
function getGrade(score: number) {
  return GRADE_MAP.find(g => score >= g.min) ?? GRADE_MAP[GRADE_MAP.length - 1]
}

const STACK_COLORS = ['#37e39f', '#22c7f2', '#8b8cff', '#f5c400', '#f75bb6']
const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(8,12,24,0.95)',
  color: '#fff',
  fontSize: 12,
}

export function DashboardExperience({
  viewer, periodLabel, stats, dailyActivity, recentPRs, topRepos, persona,
}: DashboardExperienceProps) {
  const [mode, setMode] = useState<Mode>('toast')
  const [copied, setCopied] = useState(false)
  const [scoreMini, setScoreMini] = useState<ScoreMini | null>(null)
  const [trendsMini, setTrendsMini] = useState<TrendsMini | null>(null)

  const techStack = useMemo(() => buildTechStack(topRepos), [topRepos])
  const stackTotal = techStack.reduce((s, i) => s + i.value, 0)

  // 협업 점수 + 트렌드 미니 데이터 백그라운드 fetch
  useEffect(() => {
    fetch('/api/github/score?weeks=4')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setScoreMini({ total: d.total, categories: d.categories }))
      .catch(() => {})

    fetch('/api/github/trends?months=3')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setTrendsMini(d))
      .catch(() => {})
  }, [])

  const themeClass = 'dashboard-theme-toast'
  const grade = scoreMini ? getGrade(scoreMini.total) : null

  // Personal 모드: Spotify Wrapped 풀스크린 경험으로 전환
  if (mode === 'personal') {
    return (
      <WrappedExperience
        viewer={viewer}
        stats={stats}
        persona={persona}
        dailyActivity={dailyActivity}
        recentPRs={recentPRs}
        onBack={() => setMode('toast')}
      />
    )
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn('dashboard-shell min-h-screen', themeClass)}>
      <div className="dashboard-noise" />
      <div className="dashboard-orb dashboard-orb-left" />
      <div className="dashboard-orb dashboard-orb-right" />

      {/* ── NAV ── */}
      <header className="relative z-10 border-b border-white/8 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/12 bg-white/8">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[var(--dashboard-accent)]">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--dashboard-soft)]">
              <span className="font-semibold text-[var(--dashboard-text)]">devlog</span>
              <span className="text-[var(--dashboard-muted)]">/</span>
              <span>wrapped</span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/12 bg-white/8 p-1">
            {(['toast', 'personal'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition',
                  mode === m ? 'bg-[var(--dashboard-accent)] text-black' : 'text-[var(--dashboard-soft)]',
                )}>
                {m === 'toast' ? <Sparkles className="h-3.5 w-3.5" /> : <Flame className="h-3.5 w-3.5" />}
                {m === 'toast' ? 'Dashboard' : 'Personal ✨'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-sm text-[var(--dashboard-soft)] hover:bg-white/12 transition">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
            <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--dashboard-accent)]/30 text-xs font-bold text-[var(--dashboard-accent)]">
                {viewer.login.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-[var(--dashboard-text)]">@{viewer.login}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6">

        {/* ── HERO ── */}
        <section className="pt-14 pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.46em] text-[var(--dashboard-muted)]">
            GitHub · Wrapped 
          </p>
          <h2 className="mt-4 text-5xl font-bold tracking-[-0.05em] text-[var(--dashboard-text)] sm:text-6xl">
          Your year was a<br />
            <span className="text-[var(--dashboard-accent)]">
            masterpiece
            </span>
            .
          </h2>
          <p className="mt-4 text-base text-[var(--dashboard-soft)]">
            {persona.headline}
          </p>
          <p className="mt-2 text-xs text-[var(--dashboard-muted)]">{periodLabel}</p>
        </section>

        {/* ── STATS ROW ── */}
        <section className="pb-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Activity,           label: '커밋',      value: stats.commits,  desc: '코드 변경' },
              { icon: GitPullRequest,     label: 'Pull Request', value: stats.prs,   desc: 'PR 생성' },
              { icon: MessageSquareMore,  label: '코드 리뷰', value: stats.reviews,  desc: '리뷰 작성' },
              { icon: Activity,           label: '이슈',      value: stats.issues,   desc: '이슈 처리' },
            ].map(item => {
              const Icon = item.icon
              return (
                <motion.div key={item.label} whileHover={{ y: -2 }}
                  className="glass-panel flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--dashboard-accent)]/12">
                    <Icon className="h-5 w-5 text-[var(--dashboard-accent)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-[-0.04em] text-[var(--dashboard-text)]">
                      {item.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--dashboard-muted)]">{item.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── ACTIVITY: chart + repos + PRs ── */}
        <section className="pb-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            {/* 활동 차트 */}
            <div className="glass-panel p-6 xl:col-span-7">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                일별 기여 활동
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={dailyActivity.map(d => ({
                    day: new Date(d.date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                    기여: d.count,
                  }))}
                  barSize={26}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--dashboard-soft)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--dashboard-soft)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="기여" fill="var(--dashboard-accent)" radius={[4, 4, 0, 0]}
                    style={{ filter: 'drop-shadow(0 0 5px var(--dashboard-accent))' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 레포 + PR */}
            <div className="flex flex-col gap-4 xl:col-span-5">
              {/* 레포 */}
              <div className="glass-panel flex-1 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                  기여한 레포지토리
                </p>
                {topRepos.length === 0
                  ? <p className="text-sm text-[var(--dashboard-muted)]">커밋 없음</p>
                  : <ul className="space-y-2.5">
                    {topRepos.slice(0, 4).map(r => (
                      <li key={r.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--dashboard-text)] truncate mr-2">{r.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {r.language && <span className="text-xs text-[var(--dashboard-muted)]">{r.language}</span>}
                          <span className="text-sm font-bold text-[var(--dashboard-accent)]">{r.commits}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                }
              </div>

              {/* PR */}
              <div className="glass-panel flex-1 p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">
                  최근 Pull Request
                </p>
                {recentPRs.length === 0
                  ? <p className="text-sm text-[var(--dashboard-muted)]">PR 없음</p>
                  : <ul className="space-y-2.5">
                    {recentPRs.slice(0, 4).map((pr, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          pr.state === 'MERGED' ? 'bg-[var(--dashboard-accent)]/15 text-[var(--dashboard-accent)]'
                          : pr.state === 'OPEN'   ? 'bg-green-500/15 text-green-400'
                          : 'bg-white/8 text-[var(--dashboard-muted)]'
                        }`}>
                          {pr.state === 'MERGED' ? 'Merged' : pr.state === 'OPEN' ? 'Open' : 'Closed'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--dashboard-text)]">{pr.title}</p>
                          <p className="text-xs text-[var(--dashboard-muted)]">{pr.repo} · +{pr.additions} -{pr.deletions}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                }
              </div>
            </div>
          </div>
        </section>

        {/* ── DEEPER INSIGHTS: score + trends + salary ── */}
        <section className="pb-6">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.46em] text-[var(--dashboard-muted)]">
            Deeper Analysis
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* 협업 점수 */}
            <Link href="/score" className="glass-panel group block p-5 hover:border-[var(--dashboard-accent)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dashboard-accent)]/12">
                  <Trophy className="h-5 w-5 text-[var(--dashboard-accent)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--dashboard-muted)] group-hover:text-[var(--dashboard-accent)] transition-colors" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)] mb-1">
                Collaboration Score
              </p>
              {scoreMini ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black" style={{ color: getGrade(scoreMini.total).color }}>
                      {getGrade(scoreMini.total).label}
                    </span>
                    <span className="text-lg font-bold text-[var(--dashboard-text)]">{scoreMini.total}</span>
                    <span className="text-sm text-[var(--dashboard-muted)]">/ 100</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {scoreMini.categories.slice(0, 3).map(c => (
                      <div key={c.key} className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/10">
                          <div className="h-1 rounded-full bg-[var(--dashboard-accent)]"
                            style={{ width: `${(c.score / c.max) * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-[var(--dashboard-muted)] shrink-0 w-14 truncate">{c.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-[var(--dashboard-muted)]">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
                  분석 중...
                </div>
              )}
              <p className="mt-3 text-xs text-[var(--dashboard-muted)]">PR 본문 · 커밋 메시지 · 리뷰 품질</p>
            </Link>

            {/* 기술 스택 트렌드 */}
            <Link href="/trends" className="glass-panel group block p-5 hover:border-[var(--dashboard-accent)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dashboard-accent)]/12">
                  <TrendingUp className="h-5 w-5 text-[var(--dashboard-accent)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--dashboard-muted)] group-hover:text-[var(--dashboard-accent)] transition-colors" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)] mb-1">
                Tech Stack Trend
              </p>
              <div className="space-y-2 mt-2">
                {techStack.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STACK_COLORS[i] }} />
                    <span className="flex-1 text-sm font-medium text-[var(--dashboard-text)] truncate">{item.name}</span>
                    <span className="text-xs text-[var(--dashboard-muted)]">
                      {stackTotal > 0 ? `${Math.round((item.value / stackTotal) * 100)}%` : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-[var(--dashboard-muted)]">3개월 언어 사용 변화 분석</p>
            </Link>

            {/* 연봉협상 모드 */}
            <Link href="/salary" className="glass-panel group block p-5 hover:border-[var(--dashboard-accent)]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--dashboard-accent)]/12">
                  <Wallet className="h-5 w-5 text-[var(--dashboard-accent)]" />
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--dashboard-muted)] group-hover:text-[var(--dashboard-accent)] transition-colors" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)] mb-1">
                연봉협상 모드
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--dashboard-text)]">
                2025년 연간 리포트
              </p>
              <p className="mt-2 text-sm text-[var(--dashboard-soft)]">
                Claude가 연간 GitHub 활동을 분석해 연봉협상에서 쓸 수 있는 성과 문구를 만들어 줍니다.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['커밋 수', 'PR 임팩트', '코드 기여량', '협업 스타일'].map(tag => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] text-[var(--dashboard-muted)]">{tag}</span>
                ))}
              </div>
            </Link>

          </div>
        </section>

        {/* ── TECH STACK + AI COMMENT ── */}
        <section className="pb-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* 기술 스택 도넛 */}
            <div className="glass-panel feature-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--dashboard-muted)]">Tech Stack</p>
                  <h3 className="mt-1 text-xl font-bold tracking-[-0.04em] text-[var(--dashboard-text)]">이번 기간 주요 언어</h3>
                </div>
                <Link href="/trends" className="text-xs text-[var(--dashboard-accent)] hover:underline">
                  트렌드 보기 →
                </Link>
              </div>
              <div className="grid items-center gap-5 md:grid-cols-[160px_1fr]">
                <div className="mx-auto h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={techStack} dataKey="value" nameKey="name"
                        innerRadius={48} outerRadius={74} paddingAngle={3}
                        stroke="rgba(255,255,255,0.04)" strokeWidth={2}>
                        {techStack.map((item, i) => (
                          <Cell key={item.name} fill={STACK_COLORS[i % STACK_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {techStack.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: STACK_COLORS[i], boxShadow: `0 0 8px ${STACK_COLORS[i]}` }} />
                        <span className="font-medium text-[var(--dashboard-text)]">{item.name}</span>
                      </div>
                      <span className="text-[var(--dashboard-soft)]">
                        {stackTotal > 0 ? `${Math.round((item.value / stackTotal) * 100)}%` : '0%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Toast / Roast AI 코멘트 */}
            <div className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--dashboard-muted)]">
                    AI Insight 🌟
                  </p>
                  <h3 className="mt-1 text-xl font-bold tracking-[-0.04em] text-[var(--dashboard-text)]">
                    {persona.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy(persona.toastCopy)}
                  className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-[var(--dashboard-soft)] hover:bg-white/14 transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? '복사됨!' : '복사'}
                </button>
              </div>

              <p className="text-sm text-[var(--dashboard-muted)]">{persona.headline}</p>

              <div className="flex-1 rounded-2xl border border-white/10 bg-black/14 p-4">
                <p className="text-sm leading-7 text-[var(--dashboard-soft)] italic">
                  "{persona.toastCopy}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { label: '활동일 수', value: dailyActivity.filter(d => d.count > 0).length },
                  { label: '피크 활동', value: Math.max(...dailyActivity.map(d => d.count), 0) },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-black/14 p-3">
                    <p className="text-xl font-bold text-[var(--dashboard-accent)]">{item.value}</p>
                    <p className="text-xs text-[var(--dashboard-muted)] mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-black/12 px-6 py-4 text-sm text-[var(--dashboard-soft)] sm:flex-row sm:items-center sm:justify-between mb-10">
          <p>총 {(stats.commits + stats.prs + stats.reviews).toLocaleString()}개의 기여 · devlog</p>
          <p className="text-xs text-[var(--dashboard-muted)]">{periodLabel}</p>
        </footer>
      </main>
    </div>
  )
}
