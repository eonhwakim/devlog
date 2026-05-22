"use client";

import { motion } from "framer-motion";
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
