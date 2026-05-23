"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ActivitySection } from "./ActivitySection";
import { DashboardFooter } from "./DashboardFooter";
import { useDashboardPageState } from "./DashboardPageState";
import { ExploreSection } from "./ExploreSection";
import { GitHubPulseSection } from "./GitHubPulseSection";
import { HeroSection } from "./HeroSection";
import { WrappedExperience } from "./WrappedExperience";

interface DashboardExperienceProps {
  viewer: { login: string; name: string | null };
  periodLabel: string;
  totalContributions: number;
  stats: { commits: number; prs: number; reviews: number; issues: number };
  dailyActivity: Array<{ date: string; count: number }>;
  recentPRs: Array<{
    title: string;
    repo: string;
    state: string;
    additions: number;
    deletions: number;
    mergedAt: string | null;
  }>;
  topRepos: Array<{ name: string; language: string | null; commits: number }>;
  summaryCards: Array<{
    label: string;
    value: string;
  }>;
  insightLines: string[];
  persona: {
    title: string;
    headline: string;
    aura: string;
    stats: Array<{ label: string; value: string }>;
    toastCopy: string;
    roastCopy: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

interface WeeklyData {
  stats: { commits: number; prs: number; reviews: number; issues: number };
  topRepos: Array<{ name: string; language: string | null; commits: number }>;
  recentPRs: Array<{
    title: string;
    repo: string;
    state: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    reviews: number;
    mergedAt: string | null;
    impactScore: number;
  }>;
  period: { from: string; to: string };
}

export function DashboardExperience({
  viewer,
  periodLabel,
  totalContributions,
  stats,
  dailyActivity,
  recentPRs,
  topRepos,
  summaryCards,
  insightLines,
  persona,
}: DashboardExperienceProps) {
  const { mode, showDashboard } = useDashboardPageState();
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);

  useEffect(() => {
    fetch("/api/github/weekly")
      .then((r) => r.json())
      .then((data) => {
        if (data?.stats) setWeeklyData(data);
      })
      .catch(() => {});
  }, []);

  if (mode === "personal") {
    return (
      <WrappedExperience
        viewer={viewer}
        stats={stats}
        persona={persona}
        dailyActivity={dailyActivity}
        recentPRs={recentPRs}
        topRepos={topRepos}
        onBack={showDashboard}
      />
    );
  }

  return (
    <>
      <HeroSection
        viewer={viewer}
        dailyActivity={dailyActivity}
        stats={stats}
        summaryCards={summaryCards}
        persona={persona}
        weeklyData={weeklyData}
      />

      <main className="relative z-10 mx-auto mt-12 max-w-6xl px-6 pb-24 md:mt-24">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <DashboardFooter totalContributions={totalContributions} periodLabel={periodLabel} />
          <ActivitySection
            topRepos={topRepos}
            dailyActivity={dailyActivity}
            insightLines={insightLines}
          />
          <GitHubPulseSection topRepos={topRepos} recentPRs={recentPRs} />
          <ExploreSection />
        </motion.div>
      </main>
    </>
  );
}
