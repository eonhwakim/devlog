"use client";

import { motion } from "framer-motion";
import { Activity, GitBranch, Rocket, ShieldCheck } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

interface DashboardInsightStripProps {
  cards: Array<{
    title: string;
    body: string;
    tone: "cyan" | "emerald" | "amber" | "violet";
  }>;
}

const ICON_MAP = {
  cyan: Activity,
  emerald: ShieldCheck,
  amber: Rocket,
  violet: GitBranch,
} as const;

export function DashboardInsightStrip({ cards }: DashboardInsightStripProps) {
  return (
    <motion.section
      variants={itemVariants}
      className="grid grid-cols-1 gap-4 pb-14 md:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = ICON_MAP[card.tone];
        return (
          <div
            key={card.title}
            className="glass-panel relative overflow-hidden p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_36%)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--dashboard-muted)]">
                <Icon className="h-3.5 w-3.5 text-[var(--dashboard-accent)]" />
                {card.title}
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--dashboard-soft)]">{card.body}</p>
            </div>
          </div>
        );
      })}
    </motion.section>
  );
}
