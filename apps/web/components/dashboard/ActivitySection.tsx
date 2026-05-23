"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  Clock,
  Coffee,
  Minus,
  Moon,
  Sparkles,
  Sun,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

function buildTechStack(
  topRepos: Array<{ name: string; language: string | null; commits: number }>,
) {
  const map = new Map<string, number>();
  topRepos.forEach((r) => {
    if (!r.language) return;
    map.set(r.language, (map.get(r.language) ?? 0) + r.commits);
  });
  const result = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
  return result.length > 0
    ? result
    : [
        { name: "TypeScript", value: 88 },
        { name: "JavaScript", value: 46 },
        { name: "Python", value: 18 },
      ];
}

const STACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const FOCUS_CHART_TOOLTIP = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(8,12,24,0.95)",
  color: "#fff",
  fontSize: 12,
};

type TrendChange = { lang: string; type: "new" | "gone" | "up" | "down"; percent?: number };

const CHANGE_META: Record<TrendChange["type"], { label: string; color: string; Icon: LucideIcon }> =
  {
    new: {
      label: "새로 시작",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      Icon: Sparkles,
    },
    gone: {
      label: "최근 없음",
      color: "border-white/10 bg-white/5 text-[var(--dashboard-muted)]",
      Icon: Minus,
    },
    up: {
      label: "증가",
      color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
      Icon: TrendingUp,
    },
    down: {
      label: "감소",
      color: "border-orange-500/30 bg-orange-500/10 text-orange-400",
      Icon: TrendingDown,
    },
  };

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function InsightPanel({
  commitsByHour,
  insightLines,
}: {
  commitsByHour: number[] | null;
  insightLines: string[];
}) {
  const peakHour = commitsByHour ? commitsByHour.indexOf(Math.max(...commitsByHour)) : null;
  const PeakIcon =
    peakHour === null
      ? Clock
      : peakHour >= 22 || peakHour <= 4
        ? Moon
        : peakHour <= 9
          ? Sun
          : peakHour <= 14
            ? Coffee
            : Sun;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[2.5rem] border border-white/8 bg-gradient-to-b from-[#111827] to-[#0b101a] p-8 shadow-2xl md:p-10 lg:col-span-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(49,208,164,0.06),transparent_55%)]" />
      <div className="relative z-10 flex h-full flex-col gap-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[var(--dashboard-muted)] uppercase">
              GitHub
            </p>
            <h3 className="text-xl font-black tracking-tight text-white">Dev Insights</h3>
          </div>
        </div>

        {/* ── 1. 펀치카드 (Activity Pattern) ── */}
        <div className="flex flex-1 flex-col space-y-4">
          <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-[var(--dashboard-muted)] uppercase">
            <Activity className="h-3.5 w-3.5" /> Activity Pattern
          </h4>
          <div className="flex flex-1 flex-col justify-center rounded-[1.5rem] border border-white/5 bg-black/20 p-6 backdrop-blur-sm">
            {commitsByHour ? (
              <div className="flex flex-col gap-6">
                <div className="flex h-40 items-end gap-1 md:h-48">
                  {commitsByHour.map((count, hour) => {
                    const maxVal = Math.max(...commitsByHour, 1);
                    const pct = count / maxVal;
                    const isPeak = count === maxVal && count > 0;
                    const isActive = count > 0;
                    return (
                      <div
                        key={hour}
                        className="group relative flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <motion.div
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: hour * 0.015, ease: "easeOut" }}
                          style={{
                            height: `${Math.max(4, pct * 100)}%`,
                            transformOrigin: "bottom",
                          }}
                          className={cn(
                            "w-full rounded-t-[2px] transition-all duration-300",
                            isPeak
                              ? "bg-[var(--dashboard-accent)]"
                              : isActive
                                ? "bg-[var(--dashboard-accent)]/40 hover:bg-[var(--dashboard-accent)]/60"
                                : "bg-white/5 hover:bg-white/10",
                          )}
                        />
                        <div className="absolute bottom-full z-20 mb-2 hidden flex-col items-center group-hover:flex">
                          <div className="rounded-lg border border-white/10 bg-[#0f172a] px-2.5 py-1.5 text-[10px] font-medium whitespace-nowrap text-white shadow-xl">
                            {hour}시 ·{" "}
                            <span className="font-bold text-[var(--dashboard-accent)]">
                              {count}
                            </span>
                            회
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between px-0.5 text-[9px] font-medium text-[var(--dashboard-muted)]">
                  {["00:00", "06:00", "12:00", "18:00", "23:59"].map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>

                <div className="mt-1 flex items-center gap-3 rounded-xl border border-[var(--dashboard-accent)]/10 bg-[var(--dashboard-accent)]/5 px-3 py-2">
                  <PeakIcon className="h-4 w-4 text-[var(--dashboard-accent)]" />
                  <div className="flex-1">
                    <p className="text-[11px] text-white">
                      <span className="font-bold">골든 타임은 {peakHour}시</span>
                      <span className="ml-1 text-[var(--dashboard-muted)]">
                        {peakHour !== null && (peakHour >= 22 || peakHour <= 4)
                          ? "· 심야 집중형"
                          : peakHour !== null && peakHour <= 9
                            ? "· 아침형 인간"
                            : peakHour !== null && peakHour <= 14
                              ? "· 오후 몰입형"
                              : "· 저녁형 개발자"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {insightLines.map((line) => (
                    <div
                      key={line}
                      className="rounded-xl border border-white/8 bg-black/20 px-3 py-3 text-[11px] leading-5 text-[var(--dashboard-soft)]"
                    >
                      {line}
                    </div>
                  ))}
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
      </div>
    </div>
  );
}

interface ActivitySectionProps {
  topRepos: Array<{ name: string; language: string | null; commits: number }>;
  dailyActivity: Array<{ date: string; count: number }>;
  insightLines: string[];
}

export function ActivitySection({ topRepos, dailyActivity, insightLines }: ActivitySectionProps) {
  const [commitsByHour, setCommitsByHour] = useState<number[] | null>(null);
  const [trendsChanges, setTrendsChanges] = useState<TrendChange[]>([]);

  useEffect(() => {
    fetch("/api/github/personal")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.commitsByHour && setCommitsByHour(d.commitsByHour))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/github/trends?months=6")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.changes && setTrendsChanges(d.changes))
      .catch(() => {});
  }, []);

  const techStack = useMemo(() => buildTechStack(topRepos), [topRepos]);
  const stackTotal = techStack.reduce((s, i) => s + i.value, 0);
  const dominantTech = techStack[0] ?? null;
  const secondaryTech = techStack[1] ?? null;

  const focusTimeline = useMemo(() => {
    const monthlyMap = new Map<string, number>();

    dailyActivity.forEach((day) => {
      const monthKey = day.date.slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + day.count);
    });

    const monthly = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const date = new Date(`${month}-01T00:00:00`);
        return {
          month,
          count,
          shortLabel: date.toLocaleDateString("en-US", { month: "short" }),
          longLabel: date.toLocaleDateString("ko-KR", { month: "long" }),
        };
      });

    const recentMonths = monthly.slice(-6);
    const maxCount = Math.max(...recentMonths.map((item) => item.count), 1);
    const peakMonth = monthly.reduce<(typeof monthly)[number] | null>((best, item) => {
      if (!best || item.count > best.count) return item;
      return best;
    }, null);
    const latestMonth = monthly.at(-1) ?? null;
    const previousMonth = monthly.at(-2) ?? null;
    const trendDelta =
      latestMonth && previousMonth ? latestMonth.count - previousMonth.count : null;

    const chartPoints = recentMonths.map((item) => ({
      monthKey: item.month,
      label: item.shortLabel,
      count: item.count,
      longLabel: item.longLabel,
    }));

    return {
      recentMonths,
      chartPoints,
      maxCount,
      peakMonth,
      latestMonth,
      trendDelta,
    };
  }, [dailyActivity]);

  const techNarrative = useMemo(() => {
    if (!dominantTech) {
      return "이번 기간의 기술 사용 흐름은 특정 언어 한 곳으로 강하게 쏠리기보다는 분산된 편이라, 현재는 탐색형 패턴으로 읽는 것이 더 자연스럽습니다.";
    }

    const dominantPct = stackTotal > 0 ? Math.round((dominantTech.value / stackTotal) * 100) : 0;
    const secondarySentence = secondaryTech
      ? `${secondaryTech.name}도 뒤를 받치고 있어 한 가지 기술에만 고정되기보다 보조 축이 함께 형성된 상태입니다.`
      : "상위 언어 집중도가 높아 현재 작업의 주력 기술축이 비교적 선명하게 드러납니다.";

    return `${dominantTech.name}가 전체 활동의 약 ${dominantPct}%를 차지해 이번 기간의 중심 기술로 보입니다. ${secondarySentence} 저장소 대표 언어 기준 추정치이긴 하지만, 지금 어떤 기술 위에서 가장 많은 문제를 풀고 있는지는 충분히 읽히는 구성입니다.`;
  }, [dominantTech, secondaryTech, stackTotal]);

  const focusNarrative = useMemo(() => {
    if (!focusTimeline.peakMonth || !focusTimeline.latestMonth) {
      return "월별 활동 데이터가 충분하지 않아 집중 구간을 뚜렷하게 읽어내긴 어렵지만, 활동이 더 쌓이면 어느 시점에 에너지가 몰렸는지가 이 타임라인에서 선명하게 보이게 됩니다.";
    }

    const trendText =
      focusTimeline.trendDelta === null
        ? "전월 비교 기준은 아직 충분하지 않습니다."
        : focusTimeline.trendDelta > 0
          ? `최근 한 달은 직전 달보다 ${focusTimeline.trendDelta.toLocaleString()}회 더 활발해, 모멘텀이 다시 올라오는 구간으로 해석할 수 있습니다.`
          : focusTimeline.trendDelta < 0
            ? `최근 한 달은 직전 달보다 ${Math.abs(focusTimeline.trendDelta).toLocaleString()}회 낮아져, 강한 피크 이후 숨 고르기 흐름에 가깝습니다.`
            : "최근 한 달은 직전 달과 거의 같은 리듬을 유지했습니다.";

    return `${focusTimeline.peakMonth.longLabel}이 가장 강한 집중 구간으로 나타났고, ${focusTimeline.latestMonth.longLabel} 수치를 함께 보면 이 흐름이 일시적 스퍼트였는지 현재도 이어지고 있는지 읽을 수 있습니다. ${trendText}`;
  }, [focusTimeline]);

  return (
    <motion.section
      variants={itemVariants}
      className="grid grid-cols-1 gap-6 pb-16 lg:grid-cols-12"
    >
      <InsightPanel commitsByHour={commitsByHour} insightLines={insightLines} />

      {/* RIGHT: Stacked Cards */}
      <div className="flex flex-col gap-6 lg:col-span-6">
        {/* Tech Stack Trend (Top Right) */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#121620] p-6 shadow-2xl transition-colors hover:bg-white/[0.03]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)]" />
          <div className="relative z-10 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-[var(--dashboard-muted)] uppercase">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" /> Tech Stack Trend
            </div>
            <span className="text-[10px] font-semibold tracking-wider text-[var(--dashboard-muted)] uppercase">
              % of commits
            </span>
          </div>

          <h4 className="relative z-10 mb-4 text-xl font-bold text-white">
            Languages of this period
          </h4>

          <div className="relative z-10 flex items-center gap-8">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={techStack}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={35}
                    outerRadius={60}
                    stroke="transparent"
                    paddingAngle={2}
                  >
                    {techStack.map((item, i) => (
                      <Cell key={item.name} fill={STACK_COLORS[i % STACK_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full flex-1 space-y-3.5">
              {techStack.slice(0, 5).map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: STACK_COLORS[i % STACK_COLORS.length] }}
                    />
                    <span className="font-medium text-white">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--dashboard-muted)]">
                    {stackTotal > 0 ? `${Math.round((item.value / stackTotal) * 100)}%` : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-5 rounded-[1.35rem] border border-white/8 bg-black/18 px-4 py-4">
            <p className="text-[12px] leading-6 text-[var(--dashboard-soft)]">{techNarrative}</p>
          </div>

          {/* 주목할 변화 */}
          <div className="relative z-10 mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.22em] text-[var(--dashboard-muted)] uppercase">
                주목할 변화
              </p>
              <Link
                href="/trends"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--dashboard-accent)]/30 bg-[var(--dashboard-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--dashboard-accent)] transition hover:border-[var(--dashboard-accent)]/50 hover:bg-[var(--dashboard-accent)]/18"
              >
                <ArrowRight className="h-5 w-5 text-white transition-colors group-hover:text-[var(--dashboard-accent)]" />
              </Link>
            </div>
            {trendsChanges.length === 0 ? (
              <p className="text-[11px] text-[var(--dashboard-muted)]">
                기간 내 언어 사용 패턴이 안정적으로 유지되고 있어요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trendsChanges.map((c, i) => {
                  const meta = CHANGE_META[c.type];
                  const Icon = meta.Icon;
                  return (
                    <Link key={i} href="/trends">
                      <span
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-opacity hover:opacity-70 ${meta.color}`}
                      >
                        <Icon className="h-3 w-3 shrink-0" aria-hidden />
                        <span>
                          {c.lang} · {meta.label}
                          {c.percent ? ` ${c.percent}%` : ""}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Focus Timeline (Bottom Right) */}
        <div className="relative flex flex-[2] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#121620] p-6 shadow-2xl transition-colors hover:bg-white/[0.03]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(49,208,164,0.08),transparent_45%)]" />
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <h4 className="text-2xl font-bold text-white">Focus Timeline</h4>
            <span className="text-[10px] font-semibold tracking-wider text-[var(--dashboard-muted)] uppercase">
              Monthly flow
            </span>
          </div>

          <div className="relative z-10 mb-5">
            <p className="text-sm leading-relaxed text-[var(--dashboard-soft)]">
              언제 집중도가 올라왔는지, 최근 흐름이 어떻게 움직이는지 한 카드에서 읽을 수 있게
              정리했어요.
            </p>
          </div>

          <div className="relative z-10 rounded-[2rem] border border-white/5 bg-black/20 p-4 pt-5">
            {focusTimeline.chartPoints.length === 0 ? (
              <div className="flex h-44 items-center justify-center text-sm text-[var(--dashboard-muted)]">
                월별 활동 데이터를 아직 만들 수 없어요.
              </div>
            ) : (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={focusTimeline.chartPoints}
                    margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="focusTimelineArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--dashboard-accent)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--dashboard-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      tick={{ fill: "var(--dashboard-muted)", fontSize: 10 }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip
                      contentStyle={FOCUS_CHART_TOOLTIP}
                      cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
                      formatter={(value) => [`${Number(value ?? 0).toLocaleString()}회`, "기여"]}
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as { longLabel?: string } | undefined;
                        return row?.longLabel ?? "";
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="var(--dashboard-accent)"
                      strokeWidth={2.5}
                      fill="url(#focusTimelineArea)"
                      activeDot={{
                        r: 6,
                        fill: "var(--dashboard-accent)",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      dot={({ cx, cy, payload }) => {
                        if (cx == null || cy == null) return null;
                        const point = payload as { monthKey?: string };
                        const isPeak = point.monthKey === focusTimeline.peakMonth?.month;
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isPeak ? 5 : 3.5}
                            fill={isPeak ? "var(--dashboard-accent)" : "rgba(186,230,255,0.85)"}
                            stroke={isPeak ? "#fff" : "transparent"}
                            strokeWidth={isPeak ? 1.5 : 0}
                          />
                        );
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--dashboard-muted)] uppercase">
                최고 활동월
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {focusTimeline.peakMonth?.longLabel ?? "No data"}
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-soft)]">
                {focusTimeline.peakMonth
                  ? `${focusTimeline.peakMonth.count.toLocaleString()} commits`
                  : "집중 구간 없음"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--dashboard-muted)] uppercase">
                이번 달
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {focusTimeline.latestMonth?.longLabel ?? "No data"}
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-soft)]">
                {focusTimeline.latestMonth
                  ? `${focusTimeline.latestMonth.count.toLocaleString()} commits`
                  : "최근 흐름 없음"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
              <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--dashboard-muted)] uppercase">
                전월 대비
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {focusTimeline.trendDelta === null
                  ? "Stable"
                  : focusTimeline.trendDelta > 0
                    ? "Rising"
                    : focusTimeline.trendDelta < 0
                      ? "Cooling"
                      : "Stable"}
              </p>
              <p className="mt-1 text-xs text-[var(--dashboard-soft)]">
                {focusTimeline.trendDelta === null
                  ? "이전 월 데이터 없음"
                  : `${focusTimeline.trendDelta > 0 ? "+" : ""}${focusTimeline.trendDelta.toLocaleString()} vs 전월`}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-4 rounded-[1.35rem] border border-white/8 bg-black/18 px-4 py-4">
            <p className="text-[12px] leading-6 text-[var(--dashboard-soft)]">{focusNarrative}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
