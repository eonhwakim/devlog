"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Mode = "toast" | "personal";

interface DashboardPageStateValue {
  mode: Mode;
  scrolled: boolean;
  showPersonalSoon: boolean;
  setDashboardMode: (mode: Mode) => void;
  showDashboard: () => void;
}

const DashboardPageStateContext = createContext<DashboardPageStateValue | null>(null);

export function DashboardPageStateProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("toast");
  const [scrolled, setScrolled] = useState(false);
  const [showPersonalSoon, setShowPersonalSoon] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const value = useMemo<DashboardPageStateValue>(
    () => ({
      mode,
      scrolled,
      showPersonalSoon,
      setDashboardMode: (nextMode) => {
        if (nextMode === "personal") {
          setShowPersonalSoon(true);
          window.setTimeout(() => setShowPersonalSoon(false), 1800);
          return;
        }
        setMode(nextMode);
      },
      showDashboard: () => setMode("toast"),
    }),
    [mode, scrolled, showPersonalSoon],
  );

  return (
    <DashboardPageStateContext.Provider value={value}>
      {children}
    </DashboardPageStateContext.Provider>
  );
}

export function useDashboardPageState() {
  const value = useContext(DashboardPageStateContext);

  if (!value) {
    throw new Error("useDashboardPageState must be used within DashboardPageStateProvider");
  }

  return value;
}
