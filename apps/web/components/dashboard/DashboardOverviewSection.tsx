"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarRange, GitPullRequest, Sparkles, Users } from "lucide-react";
import Link from "next/link";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

interface DashboardOverviewSectionProps {
  periodLabel: string;
  overview: {
    totalContributions: number;
    additions: number;
    deletions: number;
    mergedPRs: number;
    mergeRate: number;
    activeDays: number;
    longestStreak: number;
    reposTouched: number;
    averagePRSize: number;
    peakMonth: { label: string; count: number };
    topLanguage: string | null;
    strongestRepo: { name: string; commits: number; language: string | null } | null;
    highImpactPR: {
      title: string;
      repo: string;
      changedLines: number;
      changedFiles: number;
      reviews: number;
      state: string;
    } | null;
  };
  highlightLines: string[];
}

export function DashboardOverviewSection({
  periodLabel,
  overview,
  highlightLines,
}: DashboardOverviewSectionProps) {
  const metrics = [
    {
      label: "총 기여",
      value: overview.totalContributions.toLocaleString(),
      detail: "올해 누적 활동량",
      tone: "ocean",
    },
    {
      label: "병합률",
      value: `${overview.mergeRate}%`,
      detail: `${overview.mergedPRs.toLocaleString()}개 merged`,
      tone: "mint",
    },
    {
      label: "활동일",
      value: overview.activeDays.toLocaleString(),
      detail: `최장 ${overview.longestStreak}일 연속`,
      tone: "violet",
    },
    {
      label: "기여 레포",
      value: overview.reposTouched.toLocaleString(),
      detail: "맥락 전환 폭",
      tone: "sunset",
    },
  ] as const;

  return (
    <motion.section variants={itemVariants} className="pb-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="glass-panel relative overflow-hidden p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_75%_25%,rgba(255,125,102,0.12),transparent_30%)]" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--dashboard-accent)]/20 bg-[var(--dashboard-accent)]/10 px-4 py-1.5 text-xs font-bold tracking-[0.24em] text-[var(--dashboard-accent)] uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Overview
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-soft)]">
                {periodLabel}
              </span>
            </div>

            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.05em] text-[var(--dashboard-text)] md:text-5xl">
              숫자만 쌓인 해가 아니라,
              <br />
              <span className="text-[var(--dashboard-accent)]">기여 방식이 읽히는 해</span>였습니다.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--dashboard-soft)] md:text-base">
              총{" "}
              <strong className="text-[var(--dashboard-text)]">
                {overview.totalContributions.toLocaleString()}회
              </strong>
              의 기여와{" "}
              <strong className="text-[var(--dashboard-text)]">
                +{overview.additions.toLocaleString()} / -{overview.deletions.toLocaleString()}
              </strong>
              의 코드 변화가 쌓였습니다.{" "}
              {overview.topLanguage
                ? `대표 언어는 ${overview.topLanguage}`
                : "대표 언어는 아직 뚜렷하지 않고"}
              , {overview.peakMonth.label}에 가장 높은 밀도로 활동했습니다.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {highlightLines.map((line) => (
                <div
                  key={line}
                  className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-[var(--dashboard-soft)]"
                >
                  {line}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/salary"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--dashboard-accent)] px-5 py-3 text-sm font-bold text-black transition hover:opacity-90"
              >
                연봉협상 리포트 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/score"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-[var(--dashboard-soft)] transition hover:bg-white/10 hover:text-white"
              >
                협업 점수 분석
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                "glass-panel relative overflow-hidden p-5",
                metric.tone === "ocean" &&
                  "bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(255,255,255,0.02))]",
                metric.tone === "mint" &&
                  "bg-[linear-gradient(180deg,rgba(52,211,153,0.12),rgba(255,255,255,0.02))]",
                metric.tone === "violet" &&
                  "bg-[linear-gradient(180deg,rgba(168,85,247,0.12),rgba(255,255,255,0.02))]",
                metric.tone === "sunset" &&
                  "bg-[linear-gradient(180deg,rgba(251,146,60,0.12),rgba(255,255,255,0.02))]",
              )}
            >
              <p className="text-[10px] font-bold tracking-[0.28em] text-[var(--dashboard-muted)] uppercase">
                {metric.label}
              </p>
              <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-[var(--dashboard-text)]">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-[var(--dashboard-soft)]">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-[var(--dashboard-muted)] uppercase">
            <GitPullRequest className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" />
            PR Impact
          </div>
          {overview.highImpactPR ? (
            <>
              <h3 className="mt-4 text-lg font-bold text-[var(--dashboard-text)]">
                {overview.highImpactPR.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--dashboard-muted)]">
                {overview.highImpactPR.repo}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-lg font-black text-[var(--dashboard-text)]">
                    {overview.highImpactPR.changedLines.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[var(--dashboard-muted)]">lines</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-lg font-black text-[var(--dashboard-text)]">
                    {overview.highImpactPR.changedFiles}
                  </p>
                  <p className="text-[11px] text-[var(--dashboard-muted)]">files</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-lg font-black text-[var(--dashboard-text)]">
                    {overview.highImpactPR.reviews}
                  </p>
                  <p className="text-[11px] text-[var(--dashboard-muted)]">reviews</p>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-[var(--dashboard-soft)]">
              아직 대표 PR이 보이지 않습니다.
            </p>
          )}
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-[var(--dashboard-muted)] uppercase">
            <CalendarRange className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" />
            Momentum
          </div>
          <h3 className="mt-4 text-2xl font-black text-[var(--dashboard-text)]">
            {overview.peakMonth.label}
          </h3>
          <p className="mt-1 text-sm text-[var(--dashboard-soft)]">
            가장 강한 활동 구간으로, {overview.peakMonth.count.toLocaleString()}회의 기여가
            집중됐습니다.
          </p>
          <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-sm leading-6 text-[var(--dashboard-soft)]">
              평균 PR 규모는{" "}
              <strong className="text-[var(--dashboard-text)]">
                {overview.averagePRSize.toLocaleString()} lines
              </strong>
              , 최장 연속 활동일은{" "}
              <strong className="text-[var(--dashboard-text)]">{overview.longestStreak}일</strong>
              입니다.
            </p>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-[var(--dashboard-muted)] uppercase">
            <Users className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" />
            Focus
          </div>
          <h3 className="mt-4 text-lg font-bold text-[var(--dashboard-text)]">
            {overview.strongestRepo?.name ?? "대표 레포 미확인"}
          </h3>
          <p className="mt-1 text-sm text-[var(--dashboard-soft)]">
            {overview.strongestRepo
              ? `${overview.strongestRepo.commits.toLocaleString()} commits · ${overview.strongestRepo.language ?? "Unknown"}`
              : "상대적으로 강한 집중 레포가 아직 드러나지 않았습니다."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              overview.topLanguage ? `Top ${overview.topLanguage}` : "Language pattern pending",
              `${overview.reposTouched} repos`,
              `${overview.activeDays} active days`,
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-[var(--dashboard-soft)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
