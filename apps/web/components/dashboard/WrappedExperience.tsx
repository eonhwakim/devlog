'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, Download, Share2, Sparkles } from 'lucide-react'

// ── Props ──────────────────────────────────────────────────────────────────
interface WrappedExperienceProps {
  viewer: { login: string; name: string | null }
  stats: { commits: number; prs: number; reviews: number; issues: number }
  persona: { title: string; headline: string; roastCopy: string; toastCopy: string }
  dailyActivity: Array<{ date: string; count: number }>
  recentPRs: Array<{ title: string; repo: string; state: string; additions: number; deletions: number }>
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

// ── 섹션 2: 올해의 대장정 ─────────────────────────────────────────────────
function S2EpicPR({ epicPR, inView }: {
  epicPR: PersonalData['epicPR']
  inView: boolean
}) {
  if (!epicPR) {
    return (
      <div className="text-center max-w-lg">
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-400/60 mb-4">올해의 대장정</p>
        <p className="text-3xl font-black text-white">PR 데이터를 모으는 중이에요</p>
        <p className="mt-3 text-sm text-white/40">더 많은 PR을 작성하면 분석이 가능해집니다.</p>
      </div>
    )
  }

  const mergedDate = epicPR.mergedAt
    ? new Date(epicPR.mergedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    : null

  return (
    <div className="max-w-2xl w-full">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-amber-400/70 mb-6">
          📜 올해의 대장정
        </p>
      </motion.div>

      {/* 메인 PR 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.7 }}
        className="relative rounded-3xl border border-amber-500/20 bg-amber-500/5 p-7 overflow-hidden"
      >
        {/* 배경 글로우 */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-500/10 blur-[40px]" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-orange-500/10 blur-[30px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              epicPR.state === 'MERGED' ? 'bg-purple-500/20 text-purple-300' :
              epicPR.state === 'OPEN'   ? 'bg-green-500/20 text-green-300' :
                                          'bg-white/10 text-white/40'
            }`}>
              {epicPR.state === 'MERGED' ? '✓ Merged' : epicPR.state === 'OPEN' ? '⬤ Open' : '✗ Closed'}
            </span>
            <span className="text-xs text-white/30">{epicPR.repo}</span>
            {mergedDate && <span className="ml-auto text-xs text-white/30">{mergedDate}</span>}
          </div>

          <h2 className="text-2xl font-black tracking-[-0.04em] text-white leading-tight sm:text-3xl">
            {epicPR.title}
          </h2>

          {epicPR.bodyPreview && (
            <p className="mt-3 text-sm text-white/40 leading-relaxed line-clamp-2 italic">
              "{epicPR.bodyPreview}"
            </p>
          )}
        </div>
      </motion.div>

      {/* 통계 3개 */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { value: epicPR.commentCount, label: '개의 토론', color: 'text-amber-400' },
          { value: epicPR.reviewCount, label: '번의 리뷰', color: 'text-orange-400' },
          { value: epicPR.engagement, label: '참여 지수', color: 'text-yellow-400' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center"
          >
            <div className={`text-3xl font-black ${item.color}`}>
              <CountUp target={item.value} inView={inView} />
            </div>
            <p className="mt-1 text-[10px] text-white/40">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7 }}
        className="mt-5 text-center text-sm text-white/35"
      >
        이 PR이 올해 당신이 가장 치열하게 소통한 순간입니다.
      </motion.p>
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
        const rad = (angle * Math.PI) / 180
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
      ? `2025년 내 GitHub 소울메이트는 @${soulmate.login}! ${soulmate.reviewCount}번이나 내 코드를 봐줬다 🤝\n\ndevlog로 나만의 GitHub Wrapped 만들기`
      : `2025년 내 GitHub 활동 Wrapped! 커밋 ${stats.commits}번, PR ${stats.prs}개 🚀`
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
              "올해 내 PR에 가장 먼저 달려온 동료입니다 🎖️"
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
    const text = `🚀 나의 GitHub Wrapped\n\n${persona.title} @${viewer.login}\n커밋 ${stats.commits} · PR ${stats.prs} · 리뷰 ${stats.reviews}\n${personalData?.bioRhythmType === 'night-owl' ? '🦉 심야의 부엉이' : personalData?.bioRhythmType === 'morning-bird' ? '🌅 새벽 기상형' : ''}\n\ndevlog로 나만의 Wrapped 만들기`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const bioMeta = personalData ? BIO_RHYTHM_META[personalData.bioRhythmType] : null

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
              {bioMeta.emoji} {bioMeta.title}
              {personalData?.soulmate && (
                <> · 소울메이트 @{personalData.soulmate.login}</>
              )}
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
  viewer, stats, persona, dailyActivity, recentPRs, onBack,
}: WrappedExperienceProps) {
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(0)

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

  // 진행 표시기용 active section 추적
  useEffect(() => {
    const sections = [s1In, s2In, s3In, s4In, s5In]
    const last = sections.lastIndexOf(true)
    if (last >= 0) setActiveSection(last)
  }, [s1In, s2In, s3In, s4In, s5In])

  const SECTION_LABELS = ['캐릭터', '대장정', '생체리듬', '소울메이트', '공유']

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

      {/* ── S2: 올해의 대장정 ── */}
      <Section ref={s2Ref}
        className="before:absolute before:inset-0 before:bg-gradient-to-b before:from-amber-950/20 before:to-transparent"
      >
        <S2EpicPR epicPR={personalData?.epicPR ?? null} inView={s2In} />
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
