"use client";

import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

interface DashboardFooterProps {
  totalContributions: number;
  periodLabel: string;
}

export function DashboardFooter({ totalContributions, periodLabel }: DashboardFooterProps) {
  return (
    <motion.footer
      variants={itemVariants}
      className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-black/20 px-8 py-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-base font-medium text-[var(--dashboard-soft)]">
        총 <span className="font-bold text-white">{totalContributions.toLocaleString()}</span>
        개의 기여 · 지난 12개월
      </p>
      <p className="text-sm font-bold tracking-wider text-[var(--dashboard-muted)] uppercase">
        {periodLabel}
      </p>
    </motion.footer>
  );
}
