'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { WrappedExperience } from './WrappedExperience'
import {
  LucideIcon,
  Activity,
  ArrowRight,
  Award,
  Calendar,
  Clock,
  Coffee,
  Flame,
  Gem,
  GitPullRequest,
  Globe,
  MessageSquareMore,
  Moon,
  Share2,
  Sparkles,
  Sun,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
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


// ── Insight Panel helpers ──────────────────────────────────────────────────
interface Achievement {
  icon: LucideIcon; title: string; desc: string; unlocked: boolean; hint: string
}

function computeStreak(days: Array<{ count: number }>) {
  let max = 0, cur = 0
  for (const d of days) { if (d.count > 0) { cur++; max = Math.max(max, cur) } else cur = 0 }
  return max
}

function buildAchievements(
  stats: { commits: number; prs: number; reviews: number; issues: number },
  streak: number, activeDays: number, uniqueLangs: number, hrs: number[] | null,
): Achievement[] {
  const tot = hrs?.reduce((a, b) => a + b, 0) ?? 0
  const night = hrs ? hrs.slice(0, 5).reduce((a, b) => a + b, 0) + hrs[23] : 0
  const nightPct = tot > 0 ? Math.round((night / tot) * 100) : 0
  return [
    { icon: Gem, title: '1K 커밋', desc: `${stats.commits.toLocaleString()} 커밋`, unlocked: stats.commits >= 1000, hint: `${Math.max(0, 1000 - stats.commits)}개 남음` },
    { icon: Flame, title: '7일 연속', desc: `스트릭 ${streak}일`, unlocked: streak >= 7, hint: `현재 ${streak}일` },
    { icon: Activity, title: '마라톤 코더', desc: '30일 연속 달성', unlocked: streak >= 30, hint: `${streak}/30일` },
    { icon: Zap, title: 'PR 파워유저', desc: `PR ${stats.prs}개`, unlocked: stats.prs >= 15, hint: `${Math.max(0, 15 - stats.prs)}개 더` },
    { icon: Award, title: '리뷰 MVP', desc: `리뷰 ${stats.reviews}회`, unlocked: stats.reviews >= 20, hint: `${Math.max(0, 20 - stats.reviews)}회 더` },
    { icon: Globe, title: '폴리글랏', desc: `${uniqueLangs}개 언어`, unlocked: uniqueLangs >= 3, hint: `${uniqueLangs}/3개` },
    { icon: Moon, title: '심야 부엉이', desc: `심야 ${nightPct}%`, unlocked: nightPct > 20, hint: hrs ? `${nightPct}%/20%` : '분석 중' },
    { icon: Calendar, title: '성실 개발자', desc: `${activeDays}일 활동`, unlocked: activeDays >= 30, hint: `${activeDays}/30일` },
  ]
}

function InsightPanel({
  stats, topRepos, commitsByHour, streak, activeDays,
}: {
  stats: DashboardExperienceProps['stats']
  topRepos: DashboardExperienceProps['topRepos']
  commitsByHour: number[] | null
  streak: number
  activeDays: number
}) {
  const uniqueLangs = useMemo(() => new Set(topRepos.map(r => r.language).filter(Boolean)).size, [topRepos])
  const achievements = useMemo(() => buildAchievements(stats, streak, activeDays, uniqueLangs, commitsByHour), [stats, streak, activeDays, uniqueLangs, commitsByHour])
  
  const peakHour = commitsByHour ? commitsByHour.indexOf(Math.max(...commitsByHour)) : null
  const PeakIcon = peakHour === null ? Clock : peakHour >= 22 || peakHour <= 4 ? Moon : peakHour <= 9 ? Sun : peakHour <= 14 ? Coffee : Sun

  return (
    <div className="lg:col-span-6 flex flex-col relative overflow-hidden rounded-[2.5rem] border border-white/8 bg-gradient-to-b from-[#111827] to-[#0b101a] p-8 md:p-10 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(49,208,164,0.06),transparent_55%)] pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full gap-8">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--dashboard-muted)]">나의 GitHub</p>
            <h3 className="text-xl font-black text-white tracking-tight">개발자 분석</h3>
          </div>
        </div>

        {/* ── 1. 펀치카드 (Activity Pattern) ── */}
        <div className="space-y-4 flex-1 flex flex-col">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--dashboard-muted)] flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Activity Pattern
          </h4>
          <div className="rounded-[1.5rem] border border-white/5 bg-black/20 p-6 backdrop-blur-sm flex-1 flex flex-col justify-center">
            {commitsByHour ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-end gap-1 h-40 md:h-48">
                  {commitsByHour.map((count, hour) => {
                    const maxVal = Math.max(...commitsByHour, 1)
                    const pct = count / maxVal
                    const isPeak = count === maxVal && count > 0
                    const isActive = count > 0
                    return (
                      <div key={hour} className="relative flex-1 flex flex-col items-center justify-end group h-full">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: hour * 0.015, ease: 'easeOut' }}
                          style={{ height: `${Math.max(4, pct * 100)}%`, transformOrigin: 'bottom' }}
                          className={cn(
                            'w-full rounded-t-[2px] transition-all duration-300',
                            isPeak ? 'bg-[var(--dashboard-accent)]' : isActive ? 'bg-[var(--dashboard-accent)]/40 hover:bg-[var(--dashboard-accent)]/60' : 'bg-white/5 hover:bg-white/10'
                          )}
                        />
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex z-20 flex-col items-center">
                          <div className="rounded-lg bg-[#0f172a] border border-white/10 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-xl whitespace-nowrap">
                            {hour}시 · <span className="font-bold text-[var(--dashboard-accent)]">{count}</span>회
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-medium text-[var(--dashboard-muted)] px-0.5">
                  {['00:00','06:00','12:00','18:00','23:59'].map(h => <span key={h}>{h}</span>)}
                </div>
                
                <div className="flex items-center gap-3 mt-1 px-3 py-2 rounded-xl bg-[var(--dashboard-accent)]/5 border border-[var(--dashboard-accent)]/10">
                  <PeakIcon className="w-4 h-4 text-[var(--dashboard-accent)]" />
                  <div className="flex-1">
                    <p className="text-[11px] text-white">
                      <span className="font-bold">골든 타임은 {peakHour}시</span>
                      <span className="text-[var(--dashboard-muted)] ml-1">
                        {peakHour !== null && (peakHour >= 22 || peakHour <= 4) ? '· 심야 집중형' :
                         peakHour !== null && peakHour <= 9 ? '· 아침형 인간' :
                         peakHour !== null && peakHour <= 14 ? '· 오후 몰입형' :
                         '· 저녁형 개발자'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center gap-2 text-[11px] text-[var(--dashboard-muted)]">
                <Activity className="h-3 w-3 animate-pulse" />
                분석 중...
              </div>
            )}
          </div>
        </div>

        {/* ── 2. 뱃지 (Achievements) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--dashboard-muted)] flex items-center gap-2">
              <Award className="w-3.5 h-3.5" /> Achievements
            </h4>
            <span className="text-[10px] font-medium text-[var(--dashboard-accent)]">
              {achievements.filter(a => a.unlocked).length}/{achievements.length} 획득
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div key={a.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="group relative"
                >
                  <div className={cn(
                    'flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 aspect-square',
                    a.unlocked
                      ? 'border-[var(--dashboard-accent)]/20 bg-gradient-to-b from-[var(--dashboard-accent)]/10 to-transparent hover:border-[var(--dashboard-accent)]/40 hover:bg-[var(--dashboard-accent)]/15 shadow-[0_0_15px_rgba(49,208,164,0.05)]'
                      : 'border-white/5 bg-black/20 opacity-60 grayscale hover:opacity-80'
                  )}>
                    <Icon className={cn("w-6 h-6", a.unlocked ? "text-[var(--dashboard-accent)]" : "text-white/40")} strokeWidth={a.unlocked ? 2 : 1.5} />
                    <span className={cn('text-[9px] font-bold tracking-tight text-center leading-tight', a.unlocked ? 'text-white' : 'text-white/50')}>
                      {a.title}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30">
                    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-2.5 shadow-xl flex flex-col gap-1 items-center text-center">
                      <span className="text-[10px] font-bold text-white">{a.title}</span>
                      <span className="text-[9px] text-[var(--dashboard-muted)]">{a.unlocked ? a.desc : a.hint}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export function DashboardExperience({
  viewer, periodLabel, stats, dailyActivity, recentPRs, topRepos, persona,
}: DashboardExperienceProps) {
  const [mode, setMode] = useState<Mode>('toast')
  const [scoreMini, setScoreMini] = useState<ScoreMini | null>(null)
  const [commitsByHour, setCommitsByHour] = useState<number[] | null>(null)

  const techStack = useMemo(() => buildTechStack(topRepos), [topRepos])
  const stackTotal = techStack.reduce((s, i) => s + i.value, 0)
  const streak = useMemo(() => computeStreak(dailyActivity), [dailyActivity])
  const activeDays = useMemo(() => dailyActivity.filter(d => d.count > 0).length, [dailyActivity])

  useEffect(() => {
    fetch('/api/github/score?weeks=4')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setScoreMini({ total: d.total, categories: d.categories }))
      .catch(() => {})

    fetch('/api/github/personal')
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.commitsByHour && setCommitsByHour(d.commitsByHour))
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

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── HERO ── */}
          <motion.section variants={itemVariants} className="pt-20 pb-12 flex flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dashboard-muted)] mb-4"
            >
              <Sparkles className="h-4 w-4 text-[var(--dashboard-accent)]" />
              <span>GitHub</span>
              <span>·</span>
              <span>Verified</span>
              <span>·</span>
              <span>2025</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-black tracking-tighter text-white leading-[1.05] mb-4">
              Your year was a<br />
              <span className="text-[var(--dashboard-accent)] filter drop-shadow-[0_0_30px_rgba(49,208,164,0.3)]">
                masterpiece.
              </span>
            </h2>
            <p className="text-lg md:text-xl font-medium text-[var(--dashboard-soft)] max-w-3xl leading-relaxed">
              {persona.headline}
            </p>
          </motion.section>

          {/* ── TOP GRID (Match Image) ── */}
          <motion.section variants={itemVariants} className="pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <InsightPanel
            stats={stats}
            topRepos={topRepos}
            commitsByHour={commitsByHour}
            streak={streak}
            activeDays={activeDays}
          />

            {/* RIGHT: Stacked Cards */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Tech Stack Trend (Top Right) */}
              <div className="flex-1 rounded-[2.5rem] border border-white/5 bg-[#121620] p-8 md:p-10 hover:bg-white/[0.03] transition-colors relative overflow-hidden shadow-2xl flex flex-col justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)] pointer-events-none" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--dashboard-muted)]">
                    <TrendingUp className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" /> Tech Stack Trend
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--dashboard-muted)] uppercase tracking-wider">% of commits</span>
                </div>
                
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-6 relative z-10">Languages of 2025</h4>
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={techStack} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60} stroke="transparent" paddingAngle={2}>
                          {techStack.map((item, i) => (
                            <Cell key={item.name} fill={STACK_COLORS[i % STACK_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-3.5">
                    {techStack.slice(0, 5).map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STACK_COLORS[i % STACK_COLORS.length] }} />
                          <span className="font-medium text-white">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--dashboard-muted)]">
                          {stackTotal > 0 ? `${Math.round((item.value / stackTotal) * 100)}%` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By the numbers (Bottom Right) */}
              <div className="flex-1 rounded-[2.5rem] border border-white/5 bg-[#121620] p-8 md:p-10 hover:bg-white/[0.03] transition-colors relative overflow-hidden shadow-2xl flex flex-col justify-center">
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <h4 className="text-2xl font-bold text-white">By the numbers</h4>
                  <span className="text-[10px] font-semibold text-[var(--dashboard-muted)] uppercase tracking-wider">Total</span>
                </div>
                
                <div className="flex flex-col gap-3 relative z-10">
                  {[
                    { icon: Activity, label: 'Commits', value: stats.commits },
                    { icon: GitPullRequest, label: 'Pull Requests', value: stats.prs },
                    { icon: MessageSquareMore, label: 'Reviews', value: stats.reviews },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center justify-between p-4 md:p-5 rounded-2xl bg-black/20 hover:bg-black/40 transition-colors border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                            <Icon className="h-5 w-5 text-[var(--dashboard-muted)]" />
                          </div>
                          <span className="text-sm md:text-base font-semibold text-white">{item.label}</span>
                        </div>
                        <span className="text-2xl md:text-3xl font-black text-white">{item.value.toLocaleString()}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              
            </div>
          </motion.section>

          {/* ── DEEPER INSIGHTS (Score & Salary) ── */}
          <motion.section variants={itemVariants} className="pb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h3 className="text-xl font-bold tracking-wide text-[var(--dashboard-soft)] px-4 uppercase">
                Explore More
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 협업 점수 */}
              <Link href="/score" className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0c1620] to-[#181432] p-10 shadow-2xl transition-all duration-500 hover:border-[var(--dashboard-accent)]/50 hover:shadow-[0_0_40px_rgba(49,208,164,0.15)]">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(49,208,164,0.15),transparent_50%)] pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 mb-6">
                        <Trophy className="h-4 w-4 text-[var(--dashboard-accent)]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--dashboard-soft)]">Collaboration Score</span>
                      </div>
                      <h4 className="text-3xl font-bold text-white mb-2 group-hover:text-[var(--dashboard-accent)] transition-colors">협업 역량 분석</h4>
                      <p className="text-sm text-[var(--dashboard-muted)] max-w-sm">PR 본문, 커밋 메시지, 리뷰 품질을 다각도로 분석한 종합 점수입니다.</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[var(--dashboard-accent)]/20 transition-colors">
                      <ArrowRight className="h-5 w-5 text-white group-hover:text-[var(--dashboard-accent)] transition-colors" />
                    </div>
                  </div>

                  <div className="mt-10 flex items-end gap-8">
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
                        <div className="flex-1 space-y-3 max-w-[200px] hidden sm:block">
                          {scoreMini.categories.slice(0, 3).map(c => (
                            <div key={c.key} className="space-y-1.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[var(--dashboard-soft)] truncate max-w-[100px]">{c.label}</span>
                                <span className="text-white">{c.score} <span className="text-[var(--dashboard-muted)]">/ {c.max}</span></span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden border border-white/5">
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
                      <div className="flex items-center gap-3 text-sm text-[var(--dashboard-muted)] font-medium">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
                        분석 중...
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* 연봉 협상 */}
              <Link href="/salary" className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/5 p-10 hover:bg-[var(--dashboard-accent)]/10 transition-all duration-300">
                <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Wallet className="h-48 w-48 text-[var(--dashboard-accent)]" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-accent)]/20 border border-[var(--dashboard-accent)]/30 px-4 py-1.5 mb-6">
                      <Sparkles className="h-4 w-4 text-[var(--dashboard-accent)]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--dashboard-accent)]">Salary Negotiation</span>
                    </div>
                    <h4 className="text-3xl font-black text-white mb-3">연봉 협상 모드</h4>
                    <p className="text-sm text-[var(--dashboard-soft)] max-w-sm mb-6 leading-relaxed">
                      Claude가 연간 성과를 분석해 강력한 어필 포인트를 생성합니다. 협상 테이블에서 자신감을 가지세요.
                    </p>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex flex-wrap gap-2 max-w-[250px]">
                      {['커밋 수', 'PR 임팩트', '협업 스타일'].map(tag => (
                        <span key={tag} className="rounded-xl bg-black/40 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[var(--dashboard-accent)]/10 flex items-center justify-center border border-[var(--dashboard-accent)]/20 group-hover:bg-[var(--dashboard-accent)] transition-colors">
                      <ArrowRight className="h-5 w-5 text-[var(--dashboard-accent)] group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
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
