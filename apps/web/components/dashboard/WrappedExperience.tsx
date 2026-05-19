'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, Download, Share2, Sparkles } from 'lucide-react'

// ── Props ──────────────────────────────────────────────────────────────────
interface WrappedExperienceProps {
  viewer: { login: string; name: string | null }
  stats: { commits: number; prs: number; reviews: number; issues: number }
  persona: { title: string; headline: string; roastCopy: string; toastCopy: string }
  dailyActivity: Array<{ date: string; count: number }>
  recentPRs: Array<{ title: string; repo: string; state: string; additions: number; deletions: number; mergedAt: string | null }>
  topRepos: Array<{ name: string; language: string | null; commits: number }>
  onBack: () => void
}

interface PersonalData {
  epicPR: {
    title: string; repo: string; commentCount: number; reviewCount: number
    engagement: number; mergedAt: string | null; state: string; url: string; bodyPreview: string
  } | null
  commitsByHour: number[]
  bioRhythmType: 'night-owl' | 'morning-bird' | 'afternoon-peak' | 'evening-surge' | 'consistent'
  bioRhythmStats: { nightPct: number; morningPct: number; afternoonPct: number; eveningPct: number; peakHour: number }
  soulmate: { login: string; avatarUrl: string; reviewCount: number } | null
}

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

function computeStreak(days: Array<{ count: number }>) {
  let max = 0, cur = 0
  for (const d of days) {
    if (d.count > 0) {
      cur++
      max = Math.max(max, cur)
    } else {
      cur = 0
    }
  }
  return max
}

function formatHourLabel(hour: number | null) {
  if (hour === null || hour < 0) return 'untracked'
  return `${String(hour).padStart(2, '0')}:00`
}

function buildPersonaStudy({
  persona,
  stats,
  dailyActivity,
  topRepos,
  recentPRs,
  commitsByHour,
}: {
  persona: WrappedExperienceProps['persona']
  stats: WrappedExperienceProps['stats']
  dailyActivity: WrappedExperienceProps['dailyActivity']
  topRepos: WrappedExperienceProps['topRepos']
  recentPRs: WrappedExperienceProps['recentPRs']
  commitsByHour: number[] | null
}) {
  const activeDays = dailyActivity.filter(day => day.count > 0).length
  const strongestDay = dailyActivity.reduce((best, day) => day.count > best.count ? day : best, dailyActivity[0] ?? { date: '', count: 0 })
  const streak = computeStreak(dailyActivity)
  const mergedPRs = recentPRs.filter(pr => pr.mergedAt).length
  const mergeRate = recentPRs.length > 0 ? Math.round((mergedPRs / recentPRs.length) * 100) : 0
  const primaryRepo = topRepos[0]
  const repoSpread = topRepos.filter(repo => repo.commits > 0).length
  const reviewDensity = stats.prs > 0 ? (stats.reviews / stats.prs).toFixed(1) : '0.0'
  const lineDelta = recentPRs.reduce((sum, pr) => sum + pr.additions + pr.deletions, 0)
  const nightWork = commitsByHour ? commitsByHour.reduce((sum, count, hour) => sum + ((hour >= 22 || hour <= 4) ? count : 0), 0) : 0
  const totalHourly = commitsByHour ? commitsByHour.reduce((sum, count) => sum + count, 0) : 0
  const nightRatio = totalHourly > 0 ? Math.round((nightWork / totalHourly) * 100) : 0
  const peakHour = commitsByHour ? commitsByHour.indexOf(Math.max(...commitsByHour)) : null

  const thesis =
    stats.reviews >= stats.prs
      ? '코드를 많이 남기는 사람이라기보다, 판단의 품질을 주변으로 전염시키는 협업형 개발자에 가깝습니다.'
      : repoSpread >= 3
        ? '한 저장소에만 머무르지 않고 여러 맥락을 횡단하며 구조를 정리하는 시스템형 개발자 패턴이 관찰됩니다.'
        : '문제를 발견하면 빠르게 구현과 정리를 동시에 밀어붙이는 실행형 개발자 패턴이 우세하게 나타납니다.'

  const warmAbstract = `본 관찰은 ${activeDays}일의 활동일과 최장 ${streak}일 연속 몰입 구간을 바탕으로, ${persona.title}의 핵심을 '${thesis}'로 요약합니다. 특히 ${primaryRepo?.name ?? '핵심 저장소'} 중심의 작업 흐름과 ${formatHourLabel(peakHour)} 전후의 집중 패턴은, 당신이 단순히 많이 만드는 사람보다 맥락을 깊게 이해한 뒤 정교하게 개입하는 사람임을 시사합니다.`
  const coldAbstract = `데이터는 성실함보다 선택 편향을 더 강하게 드러냅니다. 활동은 ${primaryRepo?.name ?? '일부 저장소'}와 특정 시간대(${formatHourLabel(peakHour)})에 밀집되어 있으며, 이는 높은 집중력을 의미하는 동시에 에너지 분산과 장기 확장성 측면의 취약점도 암시합니다. 즉 강한 순간은 분명하지만, 영향력을 더 넓은 표면적으로 확장할 여지는 아직 남아 있습니다.`

  const findings = [
    {
      id: 'abstract',
      label: 'Abstract',
      eyebrow: 'Research Thesis',
      title: persona.title,
      body: thesis,
    },
    {
      id: 'signals',
      label: 'Signals',
      eyebrow: 'Observed Evidence',
      title: `${activeDays} active days, ${mergeRate}% merge closure`,
      body: `${stats.commits} commits, ${stats.prs} PRs, ${stats.reviews} reviews가 남긴 흔적은 구현량과 협업량이 함께 움직이는 개발 리듬을 보여줍니다.`,
    },
    {
      id: 'implication',
      label: 'Implication',
      eyebrow: 'Interpretation',
      title: 'Taste before velocity',
      body: `최근 PR에서 약 ${lineDelta.toLocaleString()} lines of change가 포착됐고, 리뷰 밀도는 PR당 ${reviewDensity}회 수준입니다. 이는 속도보다 기준선을 세우는 방식으로 영향력을 만드는 성향에 가깝습니다.`,
    },
  ] as const

  const evidenceCards = [
    {
      label: 'Collaboration Density',
      value: `${reviewDensity}x`,
      description: 'PR 1건당 남긴 리뷰 빈도. 팀의 판단 비용을 대신 떠안는 편입니다.',
    },
    {
      label: 'Repository Breadth',
      value: `${repoSpread} repos`,
      description: '하나의 컨텍스트보다 여러 문제공간을 넘나들며 구조를 파악하는 타입입니다.',
    },
    {
      label: 'Night Focus Ratio',
      value: `${nightRatio}%`,
      description: '심야 시간대 커밋 비중. 몰입이 깊어질수록 시간 감각보다 문제 해결이 우선됩니다.',
    },
  ]

  const microNotes = [
    strongestDay.date
      ? `Peak output day: ${strongestDay.date}에 ${strongestDay.count}회 활동이 기록됐습니다.`
      : 'Peak output day: 충분한 일별 데이터가 아직 없습니다.',
    primaryRepo
      ? `Primary context: ${primaryRepo.name} 저장소가 현재 사고의 중심축 역할을 했습니다.`
      : 'Primary context: 저장소별 집중도 데이터가 충분하지 않습니다.',
    mergedPRs > 0
      ? `Closure signal: 최근 PR ${recentPRs.length}건 중 ${mergedPRs}건이 merge로 닫혔습니다.`
      : 'Closure signal: 아직 merge 기반의 결과 신호는 약한 편입니다.',
  ]

  return {
    warmAbstract,
    coldAbstract,
    findings,
    evidenceCards,
    microNotes,
  }
}

// ── Scroll-snap 섹션 ────────────────────────────────────────────────────────
const Section = forwardRef<HTMLElement, { children: React.ReactNode; className?: string }>(
  function Section({ children, className = '' }, ref) {
    return (
      <section
        ref={ref}
        className={`relative flex min-h-screen w-full flex-col items-center justify-center px-5 py-24 ${className}`}
        style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
      >
        {children}
      </section>
    )
  }
)

// ── IntersectionObserver 훅 ─────────────────────────────────────────────────
function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.35) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return inView
}

// ── 숫자 카운트업 ─────────────────────────────────────────────────────────
function CountUp({ target, inView, suffix = '' }: { target: number; inView: boolean; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const dur = 1400
    const start = Date.now()
    const tick = () => {
      const t = Math.min((Date.now() - start) / dur, 1)
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target))
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])
  return <>{val.toLocaleString()}{suffix}</>
}

// ── 3D 카드 훅 ─────────────────────────────────────────────────────────────
function use3DCard() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const cfg = { stiffness: 200, damping: 22 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), cfg)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), cfg)
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100])
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - r.left) / r.width - 0.5)
    mouseY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onMouseLeave = () => { mouseX.set(0); mouseY.set(0) }
  return { rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave }
}

// ── 섹션 1: TCG 페르소나 카드 ──────────────────────────────────────────────
function S1Intro({ viewer, persona, stats }: {
  viewer: WrappedExperienceProps['viewer']
  persona: WrappedExperienceProps['persona']
  stats: WrappedExperienceProps['stats']
}) {
  const { rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave } = use3DCard()

  const auraColors: Record<string, string> = {
    'The Kind Reviewer':       'rgba(0,210,140,0.5)',
    'The Firefighter':         'rgba(255,120,40,0.5)',
    'The Refactoring Wizard':  'rgba(80,140,255,0.5)',
  }
  const aura = auraColors[persona.title] ?? 'rgba(110,72,230,0.5)'

  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-20 max-w-4xl w-full">
      {/* TCG 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
        className="relative h-[420px] w-[280px] shrink-0 cursor-pointer select-none"
        id="share-card-target"
      >
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/20"
          style={{
            background: `
              radial-gradient(ellipse at 12% 20%, ${aura} 0%, transparent 44%),
              radial-gradient(ellipse at 88% 80%, rgba(255,145,40,0.4) 0%, transparent 40%),
              radial-gradient(ellipse at 68% 22%, rgba(110,72,230,0.45) 0%, transparent 44%),
              radial-gradient(ellipse at 22% 82%, rgba(0,185,235,0.3) 0%, transparent 40%),
              linear-gradient(145deg, #0c1620 0%, #181432 60%, #1c1824 100%)
            `,
            boxShadow: `0 40px 100px ${aura.replace('0.5','0.25')}, 0 0 0 1px rgba(255,255,255,0.08)`,
          }}
        >
          {/* 격자 */}
          <div className="absolute inset-0 opacity-15"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
          {/* 글레어 */}
          <motion.div className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ background: useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 55%)`) }} />

          <div className="relative z-10 flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/50">DEV RPG</span>
              <span className="text-[9px] text-white/30">001</span>
            </div>

            <div className="my-3 flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-black/15 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-5xl mb-2">
                  {persona.title === 'The Kind Reviewer' ? '🌿' : persona.title === 'The Firefighter' ? '🔥' : '⚗️'}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Class · Developer</div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black tracking-[-0.03em] text-white">{persona.title}</h3>
              <p className="mt-0.5 text-xs text-white/50">{persona.headline.slice(0, 40)}…</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                {[
                  { label: 'COMMITS', value: stats.commits },
                  { label: 'PRs', value: stats.prs },
                  { label: 'REVIEWS', value: stats.reviews },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-white/8 bg-black/20 py-1.5">
                    <div className="text-sm font-black text-white">{s.value}</div>
                    <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/30">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 텍스트 */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-center lg:text-left"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--dashboard-accent)]/70">
          GitHub · Personal
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl">
          {viewer.name ?? `@${viewer.login}`}의<br />
          <span style={{ color: 'var(--dashboard-accent)' }}>올해 이야기</span>
        </h1>
        <p className="mt-5 max-w-xs text-base leading-7 text-white/55">
          {persona.toastCopy}
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex items-center gap-2 text-sm text-white/30"
        >
          <ChevronDown className="h-4 w-4 animate-bounce" />
          <span>스크롤해서 인사이트 확인</span>
        </motion.div>
      </motion.div>
    </div>
  )
}

function S2PersonaStudy({
  persona,
  stats,
  dailyActivity,
  topRepos,
  recentPRs,
  commitsByHour,
  inView,
}: {
  persona: WrappedExperienceProps['persona']
  stats: WrappedExperienceProps['stats']
  dailyActivity: WrappedExperienceProps['dailyActivity']
  topRepos: WrappedExperienceProps['topRepos']
  recentPRs: WrappedExperienceProps['recentPRs']
  commitsByHour: number[] | null
  inView: boolean
}) {
  const [isToast, setIsToast] = useState(true)
  const [activeFinding, setActiveFinding] = useState<'abstract' | 'signals' | 'implication'>('abstract')
  const study = useMemo(() => buildPersonaStudy({
    persona,
    stats,
    dailyActivity,
    topRepos,
    recentPRs,
    commitsByHour,
  }), [commitsByHour, dailyActivity, persona, recentPRs, stats, topRepos])
  const activeFindingData = study.findings.find(finding => finding.id === activeFinding) ?? study.findings[0]

  return (
    <div className="w-full max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-cyan-300/70">
          Interpretive Layer
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
          AI Code Persona
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/50 sm:text-base">
          이 섹션은 GitHub 흔적을 근거로 당신의 협업 성향과 몰입 방식까지 해석하는 독립 분석 리포트입니다.
          </p>
        </div>

        <div className="flex bg-black/40 rounded-full p-1 border border-white/10 relative shadow-inner shrink-0 self-start lg:self-auto">
          <motion.div
            className="absolute inset-y-1 left-1 rounded-full w-[calc(50%-4px)]"
            style={{
              background: isToast
                ? 'linear-gradient(135deg, rgba(49,208,164,0.2) 0%, rgba(49,208,164,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)',
              boxShadow: isToast
                ? '0 0 12px rgba(49,208,164,0.15)'
                : '0 0 12px rgba(239,68,68,0.15)',
            }}
            animate={{ x: isToast ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => setIsToast(true)}
            className={cn(
              'relative z-10 px-3.5 py-1.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1.5',
              isToast ? 'text-white' : 'text-white/45 hover:text-white/80'
            )}
          >
            <Sparkles className="w-3 h-3" /> 따뜻한 시선
          </button>
          <button
            onClick={() => setIsToast(false)}
            className={cn(
              'relative z-10 px-3.5 py-1.5 text-[10px] font-bold rounded-full transition-colors flex items-center gap-1.5',
              !isToast ? 'text-white' : 'text-white/45 hover:text-white/80'
            )}
          >
            <Share2 className="w-3 h-3" /> 냉철한 시선
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.35)] md:p-8"
      >
        <div className="absolute inset-0 opacity-50 mix-blend-screen pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              background: isToast
                ? 'radial-gradient(circle at 50% 120%, rgba(49,208,164,0.28) 0%, transparent 58%)'
                : 'radial-gradient(circle at 50% 120%, rgba(239,68,68,0.28) 0%, transparent 58%)',
            }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          />
          <motion.div
            animate={{
              rotate: 360,
              borderRadius: ['40% 60% 70% 30% / 40% 50% 60% 50%', '60% 40% 30% 70% / 50% 60% 40% 50%', '40% 60% 70% 30% / 40% 50% 60% 50%']
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className={cn(
              'absolute -bottom-[82%] left-1/2 w-[180%] aspect-square -translate-x-1/2 blur-2xl',
              isToast ? 'bg-[var(--dashboard-accent)]/15' : 'bg-red-500/15'
            )}
          />
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">
                Auto-generated self profile
              </p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
                {persona.title} as an empirical pattern
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {study.findings.map(finding => (
                <button
                  key={finding.id}
                  type="button"
                  onClick={() => setActiveFinding(finding.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all',
                    activeFinding === finding.id
                      ? isToast
                        ? 'border-[var(--dashboard-accent)] bg-[var(--dashboard-accent)]/16 text-white shadow-[0_0_24px_rgba(49,208,164,0.18)]'
                        : 'border-red-400/60 bg-red-500/12 text-white shadow-[0_0_24px_rgba(239,68,68,0.18)]'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
                  )}
                >
                  {finding.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${isToast ? 'warm' : 'cold'}-${activeFinding}`}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]"
            >
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-6 backdrop-blur-sm">
                <div className={cn(
                  'mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em]',
                  isToast ? 'border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/8 text-[var(--dashboard-accent)]' : 'border-red-400/20 bg-red-500/8 text-red-300'
                )}>
                  <span>{activeFindingData.eyebrow}</span>
                  <span className="h-1 w-1 rounded-full bg-current" />
                  <span>{isToast ? 'Supportive read' : 'Critical read'}</span>
                </div>

                <h4 className="text-2xl font-black leading-tight text-white">
                  {activeFindingData.title}
                </h4>
                <p className="mt-4 text-sm leading-8 text-white/90 sm:text-[15px]">
                  {activeFinding === 'abstract'
                    ? (isToast ? study.warmAbstract : study.coldAbstract)
                    : activeFinding === 'signals'
                      ? activeFindingData.body
                      : `${activeFindingData.body} ${isToast ? persona.toastCopy : persona.roastCopy}`}
                </p>
              </div>

              <div className="grid gap-3">
                {study.evidenceCards.map(card => (
                  <motion.div
                    key={card.label}
                    whileHover={{ y: -3, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                    className="rounded-[1.25rem] border border-white/8 bg-white/[0.04] p-4 backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/38">
                      {card.label}
                    </p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-3xl font-black text-white">{card.value}</span>
                    </div>
                    <p className="mt-2 text-[12px] leading-6 text-white/68">
                      {card.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid gap-3 md:grid-cols-3">
            {study.microNotes.map(note => (
              <div key={note} className="rounded-[1.2rem] border border-white/6 bg-black/15 px-4 py-4 text-[11px] leading-5 text-white/65">
                {note}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── 섹션 3: 생체 리듬 (24시간 클락) ──────────────────────────────────────
const BIO_RHYTHM_META = {
  'night-owl':      { emoji: '🦉', title: '심야의 부엉이', desc: '새벽 불빛 아래서 가장 빛나는 코더입니다. 자정 이후 커밋이 유독 많습니다.', gradient: 'from-indigo-900 via-slate-900 to-black', accent: '#818cf8' },
  'morning-bird':   { emoji: '🌅', title: '새벽 기상형', desc: '해가 뜨기 전부터 에디터를 여는 타입. 오전 집중력이 최고조입니다.', gradient: 'from-orange-900 via-amber-900 to-slate-900', accent: '#fb923c' },
  'afternoon-peak': { emoji: '☕', title: '오후 몰입형', desc: '점심 이후 커피 한 잔과 함께 생산성이 폭발하는 패턴입니다.', gradient: 'from-teal-900 via-cyan-900 to-slate-900', accent: '#2dd4bf' },
  'evening-surge':  { emoji: '🌆', title: '저녁 러너', desc: '업무 후 진짜 나만의 시간에 몰입하는 타입입니다.', gradient: 'from-purple-900 via-violet-900 to-slate-900', accent: '#c084fc' },
  'consistent':     { emoji: '⚖️', title: '균형 잡힌 코더', desc: '특정 시간대에 치우치지 않고 균형 있게 활동하는 안정형입니다.', gradient: 'from-emerald-900 via-green-900 to-slate-900', accent: '#34d399' },
}

function ClockFace({ commitsByHour, accent }: { commitsByHour: number[]; accent: string }) {
  const max = Math.max(...commitsByHour, 1)
  const cx = 100, cy = 100, r = 72

  return (
    <svg viewBox="0 0 200 200" className="h-56 w-56">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={18} />

      {/* 24 hour segments */}
      {commitsByHour.map((count, hour) => {
        const angle = (hour / 24) * 360 - 90
        const intensity = count / max
        if (intensity === 0) return null

        const innerR = 63
        const outerR = 81
        const segAngle = (360 / 24) * 0.8
        const startRad = ((angle - segAngle / 2) * Math.PI) / 180
        const endRad = ((angle + segAngle / 2) * Math.PI) / 180

        const x1 = cx + innerR * Math.cos(startRad)
        const y1 = cy + innerR * Math.sin(startRad)
        const x2 = cx + outerR * Math.cos(startRad)
        const y2 = cy + outerR * Math.sin(startRad)
        const x3 = cx + outerR * Math.cos(endRad)
        const y3 = cy + outerR * Math.sin(endRad)
        const x4 = cx + innerR * Math.cos(endRad)
        const y4 = cy + innerR * Math.sin(endRad)

        return (
          <path
            key={hour}
            d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`}
            fill={accent}
            opacity={0.2 + intensity * 0.8}
          />
        )
      })}

      {/* Hour labels */}
      {[0, 6, 12, 18].map(h => {
        const angle = (h / 24) * 360 - 90
        const rad = (angle * Math.PI) / 180
        const lx = cx + 93 * Math.cos(rad)
        const ly = cy + 93 * Math.sin(rad)
        return (
          <text key={h} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight="bold">
            {h === 0 ? '자정' : h === 6 ? '오전' : h === 12 ? '정오' : '오후'}
          </text>
        )
      })}

      {/* Center */}
      <circle cx={cx} cy={cy} r={50} fill="rgba(0,0,0,0.5)" />
    </svg>
  )
}

function S3BioRhythm({ personalData, inView }: { personalData: PersonalData | null; inView: boolean }) {
  if (!personalData) return null
  const meta = BIO_RHYTHM_META[personalData.bioRhythmType]
  const { bioRhythmStats } = personalData
  const peakHourLabel = `${bioRhythmStats.peakHour}시`

  return (
    <div className="max-w-2xl w-full">
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        className="text-[10px] font-bold uppercase tracking-[0.5em] mb-6"
        style={{ color: `${meta.accent}99` }}
      >
        🦉 개발자 생체 리듬
      </motion.p>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
        {/* 클락 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
          animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          <ClockFace commitsByHour={personalData.commitsByHour} accent={meta.accent} />
        </motion.div>

        {/* 설명 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <div className="text-5xl mb-3">{meta.emoji}</div>
          <h2 className="text-4xl font-black tracking-[-0.04em] text-white">{meta.title}</h2>
          <p className="mt-3 text-base text-white/50 leading-7 max-w-xs">{meta.desc}</p>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {[
              { label: '심야·새벽', pct: bioRhythmStats.nightPct },
              { label: '오전', pct: bioRhythmStats.morningPct },
              { label: '오후', pct: bioRhythmStats.afternoonPct },
              { label: '저녁', pct: bioRhythmStats.eveningPct },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-white/8 bg-white/4 px-3 py-2">
                <div className="text-lg font-black" style={{ color: meta.accent }}>
                  <CountUp target={item.pct} inView={inView} suffix="%" />
                </div>
                <div className="text-[10px] text-white/35">{item.label}</div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-white/25">
            피크 타임: <span style={{ color: meta.accent }}>{peakHourLabel}</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// ── 섹션 4: 소울메이트 ─────────────────────────────────────────────────────
function AvatarCircle({ login, avatarUrl, label, inView, delay }: {
  login: string; avatarUrl: string; label: string; inView: boolean; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.6, type: 'spring', bounce: 0.3 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-rose-400/40"
          style={{ boxShadow: '0 0 30px rgba(251,113,133,0.3)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt={login} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-black bg-rose-400 flex items-center justify-center">
          <span className="text-[8px]">❤️</span>
        </div>
      </div>
      <p className="text-xs font-bold text-white">@{login}</p>
      <p className="text-[10px] text-white/40">{label}</p>
    </motion.div>
  )
}

function S4Soulmate({ viewer, soulmate, stats, inView }: {
  viewer: WrappedExperienceProps['viewer']
  soulmate: PersonalData['soulmate']
  stats: WrappedExperienceProps['stats']
  inView: boolean
}) {
  const handleShare = async () => {
    const text = soulmate
      ? `지난 12개월 내 GitHub 소울메이트는 @${soulmate.login}! ${soulmate.reviewCount}번이나 내 코드를 봐줬다 🤝\n\ndevlog로 나만의 GitHub Wrapped 만들기`
      : `지난 12개월 내 GitHub 활동 Wrapped! 커밋 ${stats.commits}번, PR ${stats.prs}개 🚀`
    if (navigator.share) {
      await navigator.share({ text, url: window.location.href })
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`, '_blank')
    }
  }

  return (
    <div className="max-w-xl w-full text-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        className="text-[10px] font-bold uppercase tracking-[0.5em] text-rose-400/70 mb-6"
      >
        🤝 올해의 소울메이트
      </motion.p>

      {soulmate ? (
        <>
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* 나 */}
            <AvatarCircle
              login={viewer.login}
              avatarUrl={`https://github.com/${viewer.login}.png`}
              label="나"
              inView={inView}
              delay={0.2}
            />

            {/* 연결선 */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={inView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="h-px w-16 bg-gradient-to-r from-rose-500/60 to-rose-400/60" />
              <motion.div
                animate={inView ? { scale: [1, 1.2, 1] } : {}}
                transition={{ delay: 1, duration: 0.4, repeat: 2 }}
                className="text-xl"
              >
                💞
              </motion.div>
              <div className="h-px w-16 bg-gradient-to-r from-rose-400/60 to-rose-500/60" />
            </motion.div>

            {/* 소울메이트 */}
            <AvatarCircle
              login={soulmate.login}
              avatarUrl={soulmate.avatarUrl}
              label="소울메이트"
              inView={inView}
              delay={0.3}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="rounded-3xl border border-rose-500/20 bg-rose-500/5 px-6 py-5 mb-6"
          >
            <p className="text-3xl font-black text-white mb-1">
              <CountUp target={soulmate.reviewCount} inView={inView} />번
            </p>
            <p className="text-sm text-white/50">
              @{soulmate.login}이(가) 내 코드를 리뷰해 준 횟수
            </p>
            <p className="mt-3 text-xs text-rose-400/60">
              &ldquo;올해 내 PR에 가장 먼저 달려온 동료입니다 🎖️&rdquo;
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/15 px-6 py-3 text-sm font-bold text-rose-300 hover:bg-rose-500/25 transition mx-auto"
          >
            <Share2 className="h-4 w-4" />
            이 카드 슬랙/X에 공유하기
          </motion.button>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-white/5 p-8"
        >
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-xl font-bold text-white">아직 소울메이트를 찾는 중</p>
          <p className="mt-2 text-sm text-white/40">
            PR을 더 생성하고 코드 리뷰를 교환하면 소울메이트가 나타납니다.
          </p>
        </motion.div>
      )}
    </div>
  )
}

// ── 섹션 5: 공유 & 다운로드 ────────────────────────────────────────────────
function S5Share({ viewer, stats, persona, personalData, onBack, inView }: {
  viewer: WrappedExperienceProps['viewer']
  stats: WrappedExperienceProps['stats']
  persona: WrappedExperienceProps['persona']
  personalData: PersonalData | null
  onBack: () => void
  inView: boolean
}) {
  const [downloading, setDownloading] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  async function handleDownload() {
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const el = shareCardRef.current
      if (!el) return
      const canvas = await html2canvas(el, {
        backgroundColor: '#0d0d1a',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      })
      const a = document.createElement('a')
      a.download = `${viewer.login}-devlog-wrapped.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } catch (e) {
      console.error('Download failed:', e)
    } finally {
      setDownloading(false)
    }
  }

  function handleTwitter() {
    const text = `🚀 지난 12개월 GitHub Wrapped\n\n${persona.title} @${viewer.login}\n커밋 ${stats.commits} · PR ${stats.prs} · 리뷰 ${stats.reviews}\n${personalData?.bioRhythmType === 'night-owl' ? '🦉 심야의 부엉이' : personalData?.bioRhythmType === 'morning-bird' ? '🌅 새벽 기상형' : ''}\n\ndevlog로 나만의 Wrapped 만들기`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const bioMeta = personalData ? BIO_RHYTHM_META[personalData.bioRhythmType] : null
  const soulmateLine = personalData?.soulmate ? `소울메이트 @${personalData.soulmate.login}` : '혼자서도 강한 시즌'

  return (
    <div className="max-w-lg w-full text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        {/* 공유 카드 (html2canvas 대상) */}
        <div
          ref={shareCardRef}
          className="relative overflow-hidden rounded-3xl border border-white/10 p-7 mb-6 text-left"
          style={{
            background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1025 50%, #0d1a1a 100%)',
            minHeight: 240,
          }}
        >
          {/* 배경 오브 */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full opacity-30 blur-[50px]"
            style={{ background: 'var(--dashboard-accent)' }} />

          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-3">devlog · GitHub Wrapped</p>
          <p className="text-2xl font-black text-white">@{viewer.login}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--dashboard-accent)' }}>{persona.title}</p>
          <p className="mt-3 max-w-sm text-xs leading-6 text-white/52">
            {persona.toastCopy}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: '커밋', v: stats.commits },
              { label: 'PR', v: stats.prs },
              { label: '리뷰', v: stats.reviews },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-white/5 p-2.5 text-center">
                <div className="text-xl font-black text-white">{s.v.toLocaleString()}</div>
                <div className="text-[9px] text-white/30 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {bioMeta && (
            <p className="mt-4 text-xs text-white/40">
              {bioMeta.emoji} {bioMeta.title} · {soulmateLine}
            </p>
          )}
        </div>

        <p className="text-2xl font-black text-white mb-2">공유할 준비가 됐나요?</p>
        <p className="text-sm text-white/40 mb-8">이미지로 저장하거나 X(트위터)에 바로 공유하세요.</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--dashboard-accent)' }}
          >
            <Download className="h-4 w-4" />
            {downloading ? '생성 중...' : '이미지 다운로드'}
          </button>

          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 py-3.5 text-sm font-semibold text-white hover:bg-white/14 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X(트위터)에 공유
          </button>

          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-full border border-white/8 py-3 text-sm text-white/40 hover:text-white/60 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            대시보드로 돌아가기
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────
export function WrappedExperience({
  viewer, stats, persona, dailyActivity, recentPRs, topRepos, onBack,
}: WrappedExperienceProps) {
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [loading, setLoading] = useState(true)

  const s1Ref = useRef<HTMLElement>(null)
  const s2Ref = useRef<HTMLElement>(null)
  const s3Ref = useRef<HTMLElement>(null)
  const s4Ref = useRef<HTMLElement>(null)
  const s5Ref = useRef<HTMLElement>(null)

  const s1In = useInView(s1Ref)
  const s2In = useInView(s2Ref)
  const s3In = useInView(s3Ref)
  const s4In = useInView(s4Ref)
  const s5In = useInView(s5Ref)

  useEffect(() => {
    fetch('/api/github/personal')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPersonalData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeSection = useMemo(() => {
    const sections = [s1In, s2In, s3In, s4In, s5In]
    const last = sections.lastIndexOf(true)
    return last >= 0 ? last : 0
  }, [s1In, s2In, s3In, s4In, s5In])

  const SECTION_LABELS = ['인트로', '페르소나', '생체리듬', '소울메이트', '공유']

  return (
    <div
      className="dashboard-shell dashboard-theme-toast fixed inset-0 z-50 overflow-y-scroll"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      <div className="dashboard-noise" />
      <div className="dashboard-orb dashboard-orb-left" />
      <div className="dashboard-orb dashboard-orb-right" />

      {/* 고정 헤더 */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 py-3.5 backdrop-blur-md bg-black/30 border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/30 px-3.5 py-1.5 text-xs font-medium text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="h-3 w-3" /> 대시보드
        </button>

        {/* 섹션 진행 표시기 */}
        <div className="flex items-center gap-1.5">
          {SECTION_LABELS.map((label, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeSection
                  ? 'w-8 bg-[var(--dashboard-accent)]'
                  : i < activeSection
                  ? 'w-1.5 bg-[var(--dashboard-accent)]/40'
                  : 'w-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/12 bg-black/30 px-3 py-1.5">
          <Sparkles className="h-3 w-3 text-[var(--dashboard-accent)]" />
          <span className="text-xs font-bold text-white/70">Personal</span>
        </div>
      </div>

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="h-10 w-10 rounded-full border-4 border-[var(--dashboard-accent)]/20 border-t-[var(--dashboard-accent)] animate-spin" />
            <p className="mt-4 text-sm text-white/50">GitHub 데이터 분석 중...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── S1: 인트로 + 카드 ── */}
      <Section ref={s1Ref}>
        <S1Intro viewer={viewer} persona={persona} stats={stats} />
      </Section>

      {/* ── S2: AI Code Persona ── */}
      <Section ref={s2Ref}
        className="before:absolute before:inset-0 before:bg-gradient-to-b before:from-cyan-950/20 before:to-transparent"
      >
        <S2PersonaStudy
          persona={persona}
          stats={stats}
          dailyActivity={dailyActivity}
          topRepos={topRepos}
          recentPRs={recentPRs}
          commitsByHour={personalData?.commitsByHour ?? null}
          inView={s2In}
        />
      </Section>

      {/* ── S3: 생체 리듬 ── */}
      <Section ref={s3Ref}>
        {!loading && <S3BioRhythm personalData={personalData} inView={s3In} />}
      </Section>

      {/* ── S4: 소울메이트 ── */}
      <Section ref={s4Ref}
        className="before:absolute before:inset-0 before:bg-gradient-to-b before:from-rose-950/20 before:to-transparent"
      >
        <S4Soulmate
          viewer={viewer}
          soulmate={personalData?.soulmate ?? null}
          stats={stats}
          inView={s4In}
        />
      </Section>

      {/* ── S5: 공유 ── */}
      <Section ref={s5Ref}>
        <S5Share
          viewer={viewer}
          stats={stats}
          persona={persona}
          personalData={personalData}
          onBack={onBack}
          inView={s5In}
        />
      </Section>
    </div>
  )
}
