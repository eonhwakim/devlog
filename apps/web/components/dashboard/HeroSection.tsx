"use client";

import { motion } from "framer-motion";
import { NeuralHeroSection } from "./NeuralHeroSection";

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

interface HeroSectionProps {
  viewer: { login: string; name: string | null };
  stats: { commits: number; prs: number; reviews: number; issues: number };
  dailyActivity: Array<{ date: string; count: number }>;
  summaryCards: Array<{ label: string; value: string }>;
  persona: {
    title: string;
    headline: string;
    aura: string;
    stats: Array<{ label: string; value: string }>;
    toastCopy: string;
    roastCopy: string;
  };
  weeklyData?: WeeklyData | null;
}

export function HeroSection({
  viewer,
  stats,
  dailyActivity,
  summaryCards,
  persona,
  weeklyData,
}: HeroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="relative z-0 w-full"
    >
      <NeuralHeroSection
        dailyActivity={dailyActivity}
        stats={stats}
        summaryCards={summaryCards}
        persona={persona}
        viewer={viewer}
        weeklyData={weeklyData}
      />
    </motion.section>
  );
}
