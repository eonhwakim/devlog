"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Minus, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendsData {
  months: number;
  topLangs: string[];
  chartData: Array<Record<string, number | string>>;
  changes: Array<{ lang: string; type: "new" | "gone" | "up" | "down"; percent?: number }>;
  summary: { totalCommits: number; activeMonths: number; dominantLang: string | null };
}

const LANG_COLORS = ["#37e39f", "#22c7f2", "#8b8cff", "#f5c400", "#f75bb6"];

const MONTHS_OPTIONS = [3, 6, 9, 12];

type ChangeType = TrendsData["changes"][number]["type"];

const CHANGE_META: Record<ChangeType, { label: string; color: string; Icon: LucideIcon }> = {
  new: {
    label: "새로 시작",
    color: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
    Icon: Sparkles,
  },
  gone: {
    label: "최근 없음",
    color: "border-white/10 bg-white/6 text-[var(--dashboard-muted)]",
    Icon: Minus,
  },
  up: {
    label: "증가",
    color: "border-blue-500/30 bg-blue-500/15 text-blue-400",
    Icon: TrendingUp,
  },
  down: {
    label: "감소",
    color: "border-orange-500/30 bg-orange-500/15 text-orange-400",
    Icon: TrendingDown,
  },
};

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(8,12,24,0.95)",
  color: "#fff",
  fontSize: 12,
};

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [months, setMonths] = useState(6);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/github/trends?months=${months}`)
      .then((r) => {
        if (!r.ok) throw new Error("데이터 로드 실패");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [months]);

  return (
    <div className="dashboard-shell dashboard-theme-toast min-h-screen">
      <div className="dashboard-noise" />
      <div className="dashboard-orb dashboard-orb-left" />
      <div className="dashboard-orb dashboard-orb-right" />

      <header className="relative z-10 border-b border-white/8 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--dashboard-muted)] transition hover:text-[var(--dashboard-soft)]"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              대시보드
            </Link>
            <span className="text-white/10">|</span>
            <h1 className="text-base font-bold text-[var(--dashboard-text)]">기술 스택 트렌드</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/12 bg-white/8 p-1">
              {MONTHS_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    months === m
                      ? "bg-[var(--dashboard-accent)] text-black"
                      : "text-[var(--dashboard-soft)] hover:text-[var(--dashboard-text)]"
                  }`}
                >
                  {m}개월
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 rounded-full border border-white/12 bg-white/8 p-1">
              {(["bar", "line"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    chartType === type
                      ? "bg-white/15 text-[var(--dashboard-text)]"
                      : "text-[var(--dashboard-muted)]"
                  }`}
                >
                  {type === "bar" ? "막대" : "선"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl space-y-5 px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--dashboard-accent)]/30 border-t-[var(--dashboard-accent)]" />
          </div>
        )}

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        {data && !loading && (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "총 커밋", value: data.summary.totalCommits.toLocaleString() },
                { label: "활동한 달", value: `${data.summary.activeMonths} / ${data.months}개월` },
                { label: "주력 언어", value: data.summary.dominantLang ?? "-" },
              ].map((item) => (
                <div key={item.label} className="glass-panel p-4 text-center">
                  <div className="text-xl font-bold text-[var(--dashboard-accent)]">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs text-[var(--dashboard-muted)]">{item.label}</div>
                </div>
              ))}
            </div>

            {/* 언어별 분포 차트 */}
            <div className="glass-panel p-5">
              <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-[var(--dashboard-muted)] uppercase">
                언어별 월간 커밋 분포 (상위 {data.topLangs.length}개)
              </p>
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "bar" ? (
                  <BarChart data={data.chartData} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "var(--dashboard-soft)" }} />
                    {data.topLangs.map((lang, i) => (
                      <Bar
                        key={lang}
                        dataKey={lang}
                        stackId="a"
                        fill={LANG_COLORS[i % LANG_COLORS.length]}
                        radius={i === data.topLangs.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                ) : (
                  <LineChart data={data.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "var(--dashboard-soft)" }} />
                    {data.topLangs.map((lang, i) => (
                      <Line
                        key={lang}
                        type="monotone"
                        dataKey={lang}
                        stroke={LANG_COLORS[i % LANG_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3, fill: LANG_COLORS[i % LANG_COLORS.length] }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* 월별 총 커밋 */}
            <div className="glass-panel p-5">
              <p className="mb-4 text-[10px] font-bold tracking-[0.3em] text-[var(--dashboard-muted)] uppercase">
                월별 총 커밋
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "var(--dashboard-soft)", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar
                    dataKey="total"
                    fill="var(--dashboard-accent)"
                    radius={[4, 4, 0, 0]}
                    name="총 커밋"
                    style={{ filter: "drop-shadow(0 0 6px var(--dashboard-accent))" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 변화 감지 */}
            <div className="glass-panel p-5">
              <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-[var(--dashboard-muted)] uppercase">
                주목할 변화
              </p>
              {data.changes.length === 0 ? (
                <p className="text-sm text-[var(--dashboard-muted)]">
                  기간 내 언어 사용 패턴이 안정적으로 유지되고 있어요.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.changes.map((c, i) => {
                    const meta = CHANGE_META[c.type];
                    const Icon = meta.Icon;
                    return (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.color}`}
                      >
                        <Icon className="h-3 w-3 shrink-0" aria-hidden />
                        <span>
                          {c.lang} · {meta.label}
                          {c.percent ? ` ${c.percent}%` : ""}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
