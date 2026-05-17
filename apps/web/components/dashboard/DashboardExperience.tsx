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

const STACK_COLORS = ['#31d0a4', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899']
const TOOLTIP_STYLE = {
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(8,12,24,0.95)',
  color: '#fff',
  fontSize: 14,
  padding: '12px 16px',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
}

export function DashboardExperience({
  viewer, periodLabel, stats, dailyActivity, recentPRs, topRepos, persona,
}: DashboardExperienceProps) {
  const [mode, setMode] = useState<Mode>('toast')
  const [copied, setCopied] = useState(false)
  const [scoreMini, setScoreMini] = useState<ScoreMini | null>(null)

  const techStack = useMemo(() => buildTechStack(topRepos), [topRepos])
  const stackTotal = techStack.reduce((s, i) => s + i.value, 0)

  useEffect(() => {
    fetch('/api/github/score?weeks=4')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setScoreMini({ total: d.total, categories: d.categories }))
      .catch(() => {})

    fetch('/api/github/trends?months=3')
      .then(r => r.ok ? r.json() : null)
      .catch(() => {})
  }, [])

  const themeClass = 'dashboard-theme-toast'

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
    <div className={cn('dashboard-shell min-h-screen font-sans', themeClass)}>
      <div className="dashboard-noise" />
      <div className="dashboard-orb dashboard-orb-left opacity-50" />
      <div className="dashboard-orb dashboard-orb-right opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--dashboard-accent)]/10 to-transparent pointer-events-none" />

      {/* ── NAV ── */}
      <header className="relative z-50 border-b border-white/5 bg-black/10 backdrop-blur-xl px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 shadow-lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[var(--dashboard-accent)] drop-shadow-[0_0_8px_var(--dashboard-accent)]">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div className="flex items-center gap-2 text-base text-[var(--dashboard-soft)]">
              <span className="font-bold text-[var(--dashboard-text)] tracking-tight">devlog</span>
              <span className="text-[var(--dashboard-muted)]">/</span>
              <span className="font-medium">wrapped</span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1.5 shadow-inner">
            {(['toast', 'personal'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300',
                  mode === m 
                    ? 'bg-[var(--dashboard-accent)] text-black shadow-[0_0_20px_var(--dashboard-accent)] scale-105' 
                    : 'text-[var(--dashboard-soft)] hover:text-white hover:bg-white/5',
                )}>
                {m === 'toast' ? <Sparkles className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
                {m === 'toast' ? 'Dashboard' : 'Personal ✨'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[var(--dashboard-soft)] hover:bg-white/10 hover:text-white transition-all">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--dashboard-accent)] to-blue-600 text-xs font-extrabold text-black shadow-inner">
                {viewer.login.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm font-bold tracking-wide text-[var(--dashboard-text)]">@{viewer.login}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── HERO ── */}
          <motion.section variants={itemVariants} className="pt-24 pb-20 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--dashboard-accent)]/30 bg-[var(--dashboard-accent)]/10 px-4 py-1.5 mb-8"
            >
              <Sparkles className="h-4 w-4 text-[var(--dashboard-accent)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--dashboard-accent)]">
                GitHub · Wrapped 2025
              </span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-[var(--dashboard-text)] leading-[1.1]">
              Your year was a<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--dashboard-accent)] to-blue-400 filter drop-shadow-[0_0_30px_rgba(49,208,164,0.3)]">
                masterpiece.
              </span>
            </h2>
            <p className="mt-8 text-xl md:text-2xl font-medium text-[var(--dashboard-soft)] max-w-2xl mx-auto leading-relaxed">
              {persona.headline}
            </p>
            <p className="mt-6 text-sm font-semibold tracking-wider text-[var(--dashboard-muted)] uppercase">{periodLabel}</p>
          </motion.section>

          {/* ── STATS ROW ── */}
          <motion.section variants={itemVariants} className="pb-16">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              {[
                { icon: Activity,           label: '커밋',      value: stats.commits,  desc: '코드 변경' },
                { icon: GitPullRequest,     label: 'Pull Request', value: stats.prs,   desc: 'PR 생성' },
                { icon: MessageSquareMore,  label: '코드 리뷰', value: stats.reviews,  desc: '리뷰 작성' },
                { icon: Activity,           label: '이슈',      value: stats.issues,   desc: '이슈 처리' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <motion.div 
                    key={item.label} 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent p-8 backdrop-blur-md shadow-2xl group"
                  >
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[var(--dashboard-accent)]/10 blur-2xl group-hover:bg-[var(--dashboard-accent)]/20 transition-all duration-500" />
                    
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dashboard-accent)]/20 shadow-[0_0_15px_rgba(49,208,164,0.15)] mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-7 w-7 text-[var(--dashboard-accent)]" />
                    </div>
                    <div>
                      <p className="text-5xl font-black tracking-tighter text-[var(--dashboard-text)] mb-2">
                        {item.value.toLocaleString()}
                      </p>
                      <p className="text-base font-semibold tracking-wide text-[var(--dashboard-muted)] uppercase">
                        {item.label}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>

          {/* ── DEEPER INSIGHTS (Promoted to be huge and distinct) ── */}
          <motion.section variants={itemVariants} className="pb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h3 className="text-2xl font-black tracking-tight text-[var(--dashboard-text)] px-4 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm">
                Deeper Analysis
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 협업 점수 - 큰 강조 카드 */}
              <Link href="/score" className="lg:col-span-2 group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0c1620] to-[#181432] p-10 shadow-2xl transition-all duration-500 hover:border-[var(--dashboard-accent)]/50 hover:shadow-[0_0_40px_rgba(49,208,164,0.15)]">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(49,208,164,0.15),transparent_50%)]" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-6">
                        <Trophy className="h-4 w-4 text-[var(--dashboard-accent)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--dashboard-soft)]">Collaboration Score</span>
                      </div>
                      <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-[var(--dashboard-accent)] transition-colors">협업 역량 분석</h4>
                      <p className="text-lg text-[var(--dashboard-muted)] max-w-md">PR 본문, 커밋 메시지, 리뷰 품질을 다각도로 분석한 종합 점수입니다.</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[var(--dashboard-accent)]/20 transition-colors">
                      <ArrowRight className="h-5 w-5 text-white group-hover:text-[var(--dashboard-accent)] transition-colors" />
                    </div>
                  </div>

                  <div className="mt-10 flex items-end gap-12">
                    {scoreMini ? (
                      <>
                        <div className="flex items-baseline gap-3">
                          <span className="text-8xl font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" style={{ color: getGrade(scoreMini.total).color }}>
                            {getGrade(scoreMini.total).label}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-4xl font-bold text-white leading-none">{scoreMini.total}</span>
                            <span className="text-lg font-medium text-[var(--dashboard-muted)]">/ 100</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-4 max-w-md">
                          {scoreMini.categories.slice(0, 3).map(c => (
                            <div key={c.key} className="space-y-1.5">
                              <div className="flex justify-between text-sm font-semibold">
                                <span className="text-[var(--dashboard-soft)]">{c.label}</span>
                                <span className="text-white">{c.score} <span className="text-[var(--dashboard-muted)]">/ {c.max}</span></span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${(c.score / c.max) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                  className="h-full bg-gradient-to-r from-[var(--dashboard-accent)] to-blue-400 rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-xl text-[var(--dashboard-muted)] font-medium">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
                        AI가 협업 데이터를 분석하고 있습니다...
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              <div className="flex flex-col gap-6">
                {/* 기술 트렌드 */}
                <Link href="/trends" className="flex-1 group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8 hover:bg-white/[0.08] transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-soft)]">Tech Trend</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--dashboard-muted)] group-hover:text-white transition-colors group-hover:translate-x-1" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-6">3개월 언어 트렌드</h4>
                  <div className="space-y-4">
                    {techStack.slice(0, 3).map((item, i) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-black/20 border border-white/5 shadow-inner">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STACK_COLORS[i], boxShadow: `0 0 10px ${STACK_COLORS[i]}` }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-base font-bold text-white">{item.name}</span>
                            <span className="text-sm font-semibold text-[var(--dashboard-muted)]">
                              {stackTotal > 0 ? `${Math.round((item.value / stackTotal) * 100)}%` : '-'}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-black/30 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / stackTotal) * 100}%`, backgroundColor: STACK_COLORS[i] }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>

                {/* 연봉 협상 */}
                <Link href="/salary" className="flex-1 group relative overflow-hidden rounded-[2.5rem] border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/5 p-8 hover:bg-[var(--dashboard-accent)]/10 transition-all duration-300">
                  <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Wallet className="h-48 w-48 text-[var(--dashboard-accent)]" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-accent)]/20 border border-[var(--dashboard-accent)]/30 px-3 py-1 mb-4">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-accent)]">Salary Negotiation</span>
                    </div>
                    <h4 className="text-3xl font-black text-white mb-3">연봉 협상 모드</h4>
                    <p className="text-base text-[var(--dashboard-soft)] mb-6 leading-relaxed">
                      Claude가 연간 성과를 분석해 강력한 어필 포인트를 생성합니다.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['커밋 수', 'PR 임팩트', '협업 스타일'].map(tag => (
                        <span key={tag} className="rounded-xl bg-black/40 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* ── ACTIVITY: chart + repos + PRs ── */}
          <motion.section variants={itemVariants} className="pb-16">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* 활동 차트 */}
              <div className="lg:col-span-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 lg:p-10 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">일별 기여 활동</h3>
                    <p className="text-[var(--dashboard-muted)] font-medium">잔디보다 상세한 기여도 분석</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-[var(--dashboard-accent)]/10 flex items-center justify-center border border-[var(--dashboard-accent)]/20">
                    <Activity className="h-6 w-6 text-[var(--dashboard-accent)]" />
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyActivity.map(d => ({
                        day: new Date(d.date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
                        기여: d.count,
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--dashboard-muted)', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--dashboard-muted)', fontSize: 12, fontWeight: 500 }} allowDecimals={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="기여" radius={[6, 6, 0, 0]}>
                        {dailyActivity.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.count > 10 ? 'var(--dashboard-accent)' : 'rgba(49,208,164,0.4)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 레포 + PR */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* 레포 */}
                <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl hover:bg-white/[0.05] transition-colors">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 rounded-full bg-[var(--dashboard-accent)] inline-block" />
                    주요 레포지토리
                  </h3>
                  {topRepos.length === 0
                    ? <p className="text-base text-[var(--dashboard-muted)]">커밋 없음</p>
                    : <ul className="space-y-4">
                      {topRepos.slice(0, 4).map(r => (
                        <li key={r.name} className="flex items-center justify-between group cursor-default">
                          <span className="text-base font-semibold text-[var(--dashboard-text)] truncate mr-4 group-hover:text-[var(--dashboard-accent)] transition-colors">{r.name}</span>
                          <div className="flex items-center gap-3 shrink-0">
                            {r.language && <span className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-muted)] bg-white/5 px-2 py-1 rounded-md">{r.language}</span>}
                            <span className="text-lg font-black text-[var(--dashboard-accent)]">{r.commits}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  }
                </div>

                {/* PR */}
                <div className="flex-1 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl hover:bg-white/[0.05] transition-colors">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 rounded-full bg-blue-400 inline-block" />
                    최근 PR
                  </h3>
                  {recentPRs.length === 0
                    ? <p className="text-base text-[var(--dashboard-muted)]">PR 없음</p>
                    : <ul className="space-y-5">
                      {recentPRs.slice(0, 3).map((pr, i) => (
                        <li key={i} className="flex flex-col gap-2 group cursor-default">
                          <div className="flex items-center gap-3">
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${
                              pr.state === 'MERGED' ? 'bg-[var(--dashboard-accent)]/20 text-[var(--dashboard-accent)] border border-[var(--dashboard-accent)]/30'
                              : pr.state === 'OPEN'   ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-white/10 text-[var(--dashboard-muted)] border border-white/20'
                            }`}>
                              {pr.state === 'MERGED' ? 'Merged' : pr.state === 'OPEN' ? 'Open' : 'Closed'}
                            </span>
                            <p className="truncate text-base font-bold text-white group-hover:text-blue-400 transition-colors">{pr.title}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-[var(--dashboard-muted)] font-medium pl-2 border-l-2 border-white/10 ml-2">
                            <span>{pr.repo}</span>
                            <span className="flex items-center gap-1"><span className="text-green-400">+{pr.additions}</span> <span className="text-red-400">-{pr.deletions}</span></span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  }
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── AI INSIGHT (Toast / Roast) ── */}
          <motion.section variants={itemVariants} className="pb-16">
            <div className="relative overflow-hidden rounded-[3rem] border border-[var(--dashboard-accent)]/20 bg-gradient-to-br from-[var(--dashboard-accent)]/10 via-black/40 to-black/80 p-10 md:p-14 shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(49,208,164,0.1),transparent_70%)] pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 mb-6 w-max">
                    <Sparkles className="h-5 w-5 text-[var(--dashboard-accent)]" />
                    <span className="text-sm font-bold uppercase tracking-widest text-white">AI Insight</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                    {persona.title}
                  </h3>
                  <p className="text-xl text-[var(--dashboard-soft)] mb-8 font-medium">
                    {persona.headline}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: '활동일 수', value: dailyActivity.filter(d => d.count > 0).length, suffix: '일' },
                      { label: '피크 활동', value: Math.max(...dailyActivity.map(d => d.count), 0), suffix: '건/일' },
                    ].map(item => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
                        <p className="text-3xl font-black text-[var(--dashboard-accent)] mb-1">{item.value}<span className="text-base text-[var(--dashboard-muted)] ml-1 font-semibold">{item.suffix}</span></p>
                        <p className="text-sm font-bold tracking-wider text-[var(--dashboard-soft)] uppercase">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex-1 rounded-[2rem] border border-[var(--dashboard-accent)]/30 bg-black/60 p-8 md:p-10 shadow-inner relative flex flex-col justify-center">
                    <div className="absolute top-6 left-6 text-6xl text-[var(--dashboard-accent)]/20 font-serif leading-none">&quot;</div>
                    <div className="absolute bottom-2 right-6 text-6xl text-[var(--dashboard-accent)]/20 font-serif leading-none rotate-180">&quot;</div>
                    
                    <p className="text-xl md:text-2xl leading-relaxed text-white font-medium italic relative z-10 px-6">
                      {persona.toastCopy}
                    </p>
                    
                    <div className="mt-10 flex justify-end">
                      <button
                        onClick={() => handleCopy(persona.toastCopy)}
                        className="flex items-center gap-2 rounded-full bg-[var(--dashboard-accent)] text-black px-6 py-3 font-bold hover:bg-white transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
                      >
                        <Copy className="h-5 w-5" />
                        {copied ? 'Copied!' : 'Copy Quote'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ── FOOTER ── */}
          <motion.footer variants={itemVariants} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-black/20 backdrop-blur-md px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base font-medium text-[var(--dashboard-soft)]">
              총 <span className="font-bold text-white">{(stats.commits + stats.prs + stats.reviews).toLocaleString()}</span>개의 기여 · devlog 2025
            </p>
            <p className="text-sm font-bold tracking-wider text-[var(--dashboard-muted)] uppercase">{periodLabel}</p>
          </motion.footer>
        </motion.div>
      </main>
    </div>
  )
}
