"use client";

import { motion } from "framer-motion";
import { NeuralHeroSection } from "./NeuralHeroSection";

interface HeroSectionProps {
  viewer: { login: string; name: string | null };
  stats: { commits: number; prs: number; reviews: number; issues: number };
  dailyActivity: Array<{ date: string; count: number }>;
  persona: {
    title: string;
    headline: string;
    aura: string;
    stats: Array<{ label: string; value: string }>;
    toastCopy: string;
    roastCopy: string;
  };
}

export function HeroSection({ viewer, stats, dailyActivity, persona }: HeroSectionProps) {
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
        persona={persona}
        viewer={viewer}
      />
    </motion.section>
  );
}
