"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Trophy, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ScoreMini {
  total: number;
  categories: Array<{ key: string; label: string; score: number; max: number }>;
}

const GRADE_MAP = [
  { min: 85, label: "S", color: "#fbbf24" },
  { min: 70, label: "A", color: "var(--dashboard-accent)" },
  { min: 55, label: "B", color: "#34d399" },
  { min: 40, label: "C", color: "#fb923c" },
  { min: 0, label: "D", color: "#f87171" },
];

function getGrade(score: number) {
  return GRADE_MAP.find((g) => score >= g.min) ?? GRADE_MAP[GRADE_MAP.length - 1];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function ExploreSection() {
  const [scoreMini, setScoreMini] = useState<ScoreMini | null>(null);

  useEffect(() => {
    fetch("/api/github/score?weeks=4")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setScoreMini({ total: d.total, categories: d.categories }))
      .catch(() => {});
  }, []);

  return (
    <motion.section variants={itemVariants} className="pb-16">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h3 className="px-4 text-xl font-bold tracking-wide text-[var(--dashboard-soft)] uppercase">
          Explore More
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Link
          href="/score"
          className="group relative isolate overflow-hidden rounded-[2.75rem] border border-white/10 bg-[linear-gradient(135deg,#0c1620_0%,#121c2f_45%,#181432_100%)] p-10 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--dashboard-accent)]/50 hover:shadow-[0_0_50px_rgba(49,208,164,0.18)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(49,208,164,0.16),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(96,165,250,0.16),transparent_28%)] opacity-90 transition-transform duration-700 group-hover:scale-105" />
          <div className="pointer-events-none absolute inset-x-8 bottom-8 h-24 rounded-full bg-[var(--dashboard-accent)]/10 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 backdrop-blur-md">
                  <Trophy className="h-4 w-4 text-[var(--dashboard-accent)]" />
                  <span className="text-xs font-bold tracking-widest text-[var(--dashboard-soft)] uppercase">
                    Collaboration Score
                  </span>
                </div>
                <h4 className="mb-2 text-3xl font-bold text-white transition-colors group-hover:text-[var(--dashboard-accent)]">
                  협업 역량 분석
                </h4>
                <p className="max-w-sm text-sm leading-relaxed text-[var(--dashboard-muted)]">
                  PR 본문, 커밋 메시지, 리뷰 품질을 다각도로 분석한 종합 점수입니다.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/6 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[var(--dashboard-accent)]/20">
                <ArrowRight className="h-5 w-5 text-white transition-colors group-hover:text-[var(--dashboard-accent)]" />
              </div>
            </div>

            <div className="mt-8 grid gap-1 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="flex items-center">
                {scoreMini ? (
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-8xl font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:scale-105"
                      style={{ color: getGrade(scoreMini.total).color }}
                    >
                      {getGrade(scoreMini.total).label}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-4xl leading-none font-bold text-white">
                        {scoreMini.total}
                      </span>
                      <span className="mt-1 text-sm font-medium text-[var(--dashboard-muted)]">
                        / 100
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm font-medium text-[var(--dashboard-muted)]">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
                    분석 중...
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {(scoreMini?.categories.slice(0, 3) ?? []).map((c) => (
                  <div
                    key={c.key}
                    className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="max-w-[120px] truncate text-[var(--dashboard-soft)]">
                        {c.label}
                      </span>
                      <span className="text-white">
                        {c.score}
                        <span className="ml-1 text-[var(--dashboard-muted)]">/ {c.max}</span>
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-black/40">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(c.score / c.max) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-[var(--dashboard-accent)] to-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/salary"
          className="group relative isolate overflow-hidden rounded-[2.75rem] border border-[var(--dashboard-accent)]/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(8,12,20,0.96)_30%,rgba(255,125,102,0.16)_100%)] p-10 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--dashboard-accent)]/45 hover:shadow-[0_0_50px_rgba(255,125,102,0.14)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,125,102,0.22),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(34,211,238,0.14),transparent_26%)] transition-transform duration-700 group-hover:scale-105" />
          <div className="pointer-events-none absolute -right-8 -bottom-10 opacity-20 transition-all duration-700 group-hover:-translate-y-2 group-hover:scale-110">
            <Wallet className="h-48 w-48 text-[var(--dashboard-accent)]" />
          </div>
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--dashboard-accent)]/25 bg-black/20 px-4 py-1.5 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-[var(--dashboard-accent)]" />
                  <span className="text-xs font-bold tracking-widest text-[var(--dashboard-accent)] uppercase">
                    Salary Negotiation
                  </span>
                </div>
                <h4 className="mb-3 text-3xl font-black text-white">연봉 협상 모드</h4>
                <p className="max-w-sm text-sm leading-relaxed text-[var(--dashboard-soft)]">
                  Claude가 연간 성과를 분석해 강력한 어필 포인트를 생성합니다. 협상 테이블에서
                  자신감을 가지세요.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[var(--dashboard-accent)]">
                <ArrowRight className="h-5 w-5 text-[var(--dashboard-accent)] transition-colors group-hover:text-black" />
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/8 bg-black/22 p-5 backdrop-blur-md">
              <div className="flex flex-wrap gap-2">
                {["커밋 수", "PR 임팩트", "협업 스타일", "연간 성과 요약"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-white/8 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/82 transition-colors duration-300 group-hover:border-[var(--dashboard-accent)]/20 group-hover:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "성과 정리", value: "1 min" },
                  { label: "어필 포인트", value: "3x" },
                  { label: "협상 자신감", value: "up" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/8 bg-black/25 px-3 py-3 text-center transition-transform duration-300 group-hover:-translate-y-0.5"
                  >
                    <p className="text-lg font-black text-white">{item.value}</p>
                    <p className="mt-1 text-[11px] font-semibold text-[var(--dashboard-muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </motion.section>
  );
}
