"use client";

import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

interface GitHubPulseSectionProps {
  topRepos: Array<{ name: string; language: string | null; commits: number }>;
  recentPRs: Array<{
    title: string;
    repo: string;
    state: string;
    additions: number;
    deletions: number;
    mergedAt: string | null;
  }>;
}

export function GitHubPulseSection({ topRepos, recentPRs }: GitHubPulseSectionProps) {
  const strongestRepo = topRepos[0] ?? null;
  const mergedCount = recentPRs.filter((pr) => pr.state === "MERGED").length;
  const averageChangeSize =
    recentPRs.length > 0
      ? Math.round(
          recentPRs.reduce((sum, pr) => sum + pr.additions + pr.deletions, 0) / recentPRs.length,
        )
      : 0;
  const repoNarrative = strongestRepo
    ? `${strongestRepo.name}가 현재 가장 많이 손댄 저장소로 보이며, ${strongestRepo.commits.toLocaleString()}개의 커밋이 쌓여 이번 기간의 중심 맥락 역할을 하고 있습니다. ${strongestRepo.language ? `${strongestRepo.language} 축에서 가장 많은 에너지가 쓰였다는 의미이기도 합니다.` : "대표 언어는 뚜렷하지 않지만, 집중의 축은 비교적 선명합니다."}`
    : "이번 기간에는 특정 저장소 하나가 중심으로 튀기보다는 여러 레포에 활동이 분산된 패턴으로 보입니다.";
  const prNarrative =
    recentPRs.length > 0
      ? `최근 대표 PR ${recentPRs.length}건 중 ${mergedCount}건이 실제로 닫혔고, 평균 변경 규모는 ${averageChangeSize.toLocaleString()} lines였습니다. 단순히 PR을 많이 열었다기보다 일정 단위의 변화를 끝까지 밀어 넣는 흐름이 어느 정도 유지되고 있다고 읽을 수 있습니다.`
      : "최근 PR 데이터가 많지 않아 shipping 패턴을 강하게 해석하긴 어렵지만, 이후 활동이 쌓이면 열고 닫는 리듬을 더 분명하게 볼 수 있습니다.";

  return (
    <motion.section variants={itemVariants} className="pb-16">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <h3 className="px-4 text-xl font-bold tracking-wide text-[var(--dashboard-soft)] uppercase">
          GitHub Pulse
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[2.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-colors hover:bg-white/[0.06]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-[var(--dashboard-muted)] uppercase">
                Repository Focus
              </p>
              <h3 className="mt-2 flex items-center gap-2 text-xl font-bold text-white">
                <span className="inline-block h-6 w-2 rounded-full bg-[var(--dashboard-accent)]" />
                주요 레포지토리
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-[var(--dashboard-soft)]">
              {topRepos.length} touched
            </span>
          </div>
          {topRepos.length === 0 ? (
            <p className="text-base text-[var(--dashboard-muted)]">커밋 없음</p>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-4">
                {topRepos.slice(0, 4).map((r, index) => (
                  <li
                    key={r.name}
                    className="group flex items-center justify-between rounded-2xl border border-white/6 bg-black/20 px-4 py-4 transition-all duration-300 hover:border-[var(--dashboard-accent)]/20 hover:bg-black/30"
                  >
                    <div className="mr-4 min-w-0">
                      <p className="truncate text-base font-semibold text-[var(--dashboard-text)] transition-colors group-hover:text-[var(--dashboard-accent)]">
                        {r.name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--dashboard-muted)]">
                        #{index + 1} active repository this period
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {r.language && (
                        <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-bold tracking-wider text-[var(--dashboard-muted)] uppercase">
                          {r.language}
                        </span>
                      )}
                      <span className="text-lg font-black text-[var(--dashboard-accent)]">
                        {r.commits}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="rounded-[1.35rem] border border-white/8 bg-black/18 px-4 py-4">
                <p className="text-[12px] leading-6 text-[var(--dashboard-soft)]">
                  {repoNarrative}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[2.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-colors hover:bg-white/[0.06]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-[var(--dashboard-muted)] uppercase">
                Shipping Radar
              </p>
              <h3 className="mt-2 flex items-center gap-2 text-xl font-bold text-white">
                <span className="inline-block h-6 w-2 rounded-full bg-blue-400" />
                최근 PR
              </h3>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-[var(--dashboard-soft)]">
              {recentPRs.length} updates
            </span>
          </div>
          {recentPRs.length === 0 ? (
            <p className="text-base text-[var(--dashboard-muted)]">PR 없음</p>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-4">
                {recentPRs.slice(0, 3).map((pr, i) => (
                  <li
                    key={i}
                    className="group flex flex-col gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-4 transition-all duration-300 hover:border-blue-400/25 hover:bg-black/30"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide ${
                          pr.state === "MERGED"
                            ? "border border-[var(--dashboard-accent)]/30 bg-[var(--dashboard-accent)]/20 text-[var(--dashboard-accent)]"
                            : pr.state === "OPEN"
                              ? "border border-blue-500/30 bg-blue-500/20 text-blue-400"
                              : "border border-white/20 bg-white/10 text-[var(--dashboard-muted)]"
                        }`}
                      >
                        {pr.state === "MERGED" ? "Merged" : pr.state === "OPEN" ? "Open" : "Closed"}
                      </span>
                      <p className="truncate text-base font-bold text-white transition-colors group-hover:text-blue-300">
                        {pr.title}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center gap-3 border-l-2 border-white/10 pl-3 text-sm font-medium text-[var(--dashboard-muted)]">
                      <span>{pr.repo}</span>
                      <span className="flex items-center gap-1">
                        <span className="text-green-400">+{pr.additions}</span>
                        <span className="text-red-400">-{pr.deletions}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="rounded-[1.35rem] border border-white/8 bg-black/18 px-4 py-4">
                <p className="text-[12px] leading-6 text-[var(--dashboard-soft)]">{prNarrative}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
