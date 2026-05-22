"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { NeuralGrass } from "./NeuralGrass";

interface NeuralHeroProps {
  dailyActivity: Array<{ date: string; count: number }>;
  stats: { commits: number; prs: number; reviews: number; issues: number };
  summaryCards: Array<{
    label: string;
    value: string;
  }>;
  persona: { title: string; headline: string };
  viewer: { login: string; name: string | null };
}

export function NeuralHeroSection({
  dailyActivity,
  stats,
  summaryCards,
  persona,
  viewer,
}: NeuralHeroProps) {
  const activeDays = useMemo(
    () => dailyActivity.filter((day) => day.count > 0).length,
    [dailyActivity],
  );

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030508]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.03),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_40%,#030508_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-[#030508] via-[#030508]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-[#030508] to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-[15vh] z-0 flex flex-col items-center justify-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full px-4 text-center"
        >
          <h2 className="text-[3rem] leading-[0.9] font-black tracking-[-0.04em] text-white/5 uppercase mix-blend-screen md:text-[5.5rem] lg:text-[7.5rem]">
            <span className="font-outline-2 block opacity-70">INSIDE YOUR</span>
            <span className="mt-2 block bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent opacity-90 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              DEV BRAIN
            </span>
          </h2>
        </motion.div>
      </div>
      <div className="flex w-full items-center justify-center">
        <NeuralGrass dailyActivity={dailyActivity} summaryCards={summaryCards} />
      </div>
      {/*  
      <div className="flex w-full items-center justify-center">
        <NeuralHero dailyActivity={dailyActivity} stats={stats} persona={persona} viewer={viewer} />
      </div>

      <div className="absolute inset-x-0 bottom-[25%] z-40 flex justify-center">
        <div className="pointer-events-auto">
          <GrassGarden dailyActivity={dailyActivity} />
        </div>
      </div> */}
    </section>
  );
}
