"use client";

import { Flame, LogOut, Share2, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useDashboardPageState } from "./DashboardPageState";

interface DashboardHeaderProps {
  viewer: { login: string; name: string | null };
}

function cn(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export function DashboardHeader({ viewer }: DashboardHeaderProps) {
  const { mode, scrolled, showPersonalSoon, setDashboardMode } = useDashboardPageState();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-6 py-5 transition-all duration-300",
        scrolled
          ? "bg-black/40 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
          : "bg-transparent backdrop-blur-none",
      )}
    >
      <div className="relative mx-auto flex max-w-7xl items-center">
        {/* Left — logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/20 to-white/5 shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-[var(--dashboard-accent)] drop-shadow-[0_0_8px_var(--dashboard-accent)]"
            >
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-base text-[var(--dashboard-soft)]">
            <span className="font-bold tracking-tight text-[var(--dashboard-text)]">devlog</span>
            <span className="text-[var(--dashboard-muted)]">/</span>
            <span className="font-medium">wrapped</span>
          </div>
        </div>

        {/* Center — toggle (absolute for true centering) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="relative flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1.5 shadow-inner">
            {(["toast", "personal"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDashboardMode(m)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300",
                  mode === m
                    ? "scale-105 bg-[var(--dashboard-accent)] text-black shadow-[0_0_20px_var(--dashboard-accent)]"
                    : m === "personal"
                      ? "cursor-not-allowed text-[var(--dashboard-soft)]/60 hover:bg-white/5"
                      : "text-[var(--dashboard-soft)] hover:bg-white/5 hover:text-white",
                )}
              >
                {m === "toast" ? <Sparkles className="h-4 w-4" /> : <Flame className="h-4 w-4" />}
                {m === "toast" ? "Dashboard" : "Personal"}
              </button>
            ))}
            {showPersonalSoon && (
              <div className="absolute top-full left-1/2 z-20 mt-3 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0f172a]/95 px-4 py-2 text-xs font-semibold whitespace-nowrap text-white shadow-2xl backdrop-blur-md">
                To be continue...
                <div className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-t border-l border-white/10 bg-[#0f172a]/95" />
              </div>
            )}
          </div>
        </div>

        {/* Right — share + user + logout */}
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[var(--dashboard-soft)] transition-all hover:bg-white/10 hover:text-white">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--dashboard-accent)] to-blue-600 text-xs font-extrabold text-black shadow-inner">
              {viewer.login.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-bold tracking-wide text-[var(--dashboard-text)]">
              @{viewer.login}
            </span>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[var(--dashboard-soft)] transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            title="로그아웃"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
