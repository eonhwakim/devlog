'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { NeuralHero } from './NeuralHero'

interface NeuralHeroProps {
  dailyActivity: Array<{ date: string; count: number }>
  stats: { commits: number; prs: number; reviews: number; issues: number }
  persona: { title: string; headline: string }
  viewer: { login: string; name: string | null }
}

export function NeuralHeroSection({ dailyActivity, stats, persona, viewer }: NeuralHeroProps) {
  const activeDays = useMemo(() => dailyActivity.filter(day => day.count > 0).length, [dailyActivity])

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030508]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.03),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_40%,#030508_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#030508] via-[#030508]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#030508] to-transparent" />

      <div className="absolute inset-x-0 top-[8vh] z-0 flex flex-col items-center justify-start pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="w-full px-4 text-center"
        >
          <h2 className="text-[3rem] leading-[0.9] font-black tracking-[-0.04em] text-white/5 uppercase mix-blend-screen md:text-[5.5rem] lg:text-[7.5rem]">
            <span className="font-outline-2 block opacity-70">INSIDE YOUR</span>
            <span className="mt-2 block bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent opacity-90 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              DEV BRAIN
            </span>
          </h2>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center">
        <NeuralHero
          dailyActivity={dailyActivity}
          stats={stats}
          persona={persona}
          viewer={viewer}
        />
      </div>

      <div className="absolute bottom-12 left-0 right-0 z-30 px-6 pointer-events-none">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-950/40 px-5 py-2.5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-100">
              Live Neural Activity
            </span>
          </motion.div>

          <div className="flex gap-6 sm:gap-10">
            {[
              { label: '활성화 일수', value: `${activeDays}일` },
              { label: '총 커밋', value: stats.commits.toLocaleString() },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.1, ease: 'easeOut' }}
                className="flex flex-col items-end text-right drop-shadow-lg"
              >
                <div className="text-3xl font-black text-white md:text-4xl">{item.value}</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
