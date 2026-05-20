import { motion } from "framer-motion";
import { useMemo } from "react";

// Aligned with NeuralHero layerPalette (white → light-blue → deep-blue)
const GRASS_COLORS = [
  "rgba(57, 128, 255, 0.07)", // level 0 — inactive, barely visible
  "rgba(57, 128, 255, 0.40)", // level 1 — deep blue
  "rgba(76, 188, 255, 0.68)", // level 2 — mid blue
  "rgba(123, 215, 255, 0.88)", // level 3 — light blue
  "rgba(196, 241, 255, 1.0)", // level 4 — near-white (NeuralHero top layer)
];

interface GrassGardenProps {
  dailyActivity: Array<{ date: string; count: number }>;
}

interface GardenDay {
  date: string;
  count: number;
  level: number;
  isPadding: boolean;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildGardenData(dailyActivity: Array<{ date: string; count: number }>) {
  const rows = 7;
  const targetCols = 24;
  if (dailyActivity.length === 0) {
    return { cols: 0, weeks: [] as GardenDay[][] };
  }

  const sorted = [...dailyActivity].sort((a, b) => a.date.localeCompare(b.date));
  const countByDate = new Map(sorted.map((day) => [day.date, day.count]));
  const maxCount = Math.max(...sorted.map((day) => day.count), 0);

  const lastDate = new Date(`${sorted[sorted.length - 1].date}T00:00:00`);
  const endDate = new Date(lastDate);
  endDate.setDate(lastDate.getDate() + (6 - lastDate.getDay()));

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - targetCols * 7 + 1);

  const days: GardenDay[] = [];
  for (let cursor = new Date(startDate); cursor <= endDate; cursor.setDate(cursor.getDate() + 1)) {
    const key = toDateKey(cursor);
    const count = countByDate.get(key) ?? 0;
    const ratio = maxCount > 0 ? count / maxCount : 0;
    const level = count <= 0 ? 0 : ratio >= 0.8 ? 4 : ratio >= 0.55 ? 3 : ratio >= 0.3 ? 2 : 1;
    days.push({
      date: key,
      count,
      level,
      isPadding: !countByDate.has(key) && count === 0,
    });
  }

  const weeks: GardenDay[][] = [];
  for (let i = 0; i < days.length; i += rows) {
    weeks.push(days.slice(i, i + rows));
  }

  return { cols: weeks.length, weeks };
}

function buildStats(dailyActivity: Array<{ date: string; count: number }>) {
  const totalCommits = dailyActivity.reduce((sum, day) => sum + day.count, 0);
  const activeDays = dailyActivity.filter((day) => day.count > 0).length;

  let currentStreak = 0;
  let bestStreak = 0;
  const sorted = [...dailyActivity].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of sorted) {
    if (day.count > 0) {
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return { totalCommits, activeDays, bestStreak };
}

interface Connection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  delay: number;
}

export function GrassGarden({ dailyActivity }: GrassGardenProps) {
  const rows = 7;
  const { cols, weeks } = useMemo(() => buildGardenData(dailyActivity), [dailyActivity]);
  const { totalCommits, activeDays, bestStreak } = useMemo(
    () => buildStats(dailyActivity),
    [dailyActivity],
  );

  const cellW = 24;
  const cellH = 12;
  const gapX = 8;
  const gapY = 10;
  const gridW = cols * (cellW + gapX);
  const gridH = rows * (cellH + gapY);

  // Neuron synapse connections between adjacent active cells
  const connections = useMemo<Connection[]>(() => {
    const result: Connection[] = [];

    weeks.forEach((week, colIndex) => {
      week.forEach((day, rowIndex) => {
        if (day.isPadding || day.level === 0) return;

        const cx = colIndex * (cellW + gapX) + cellW / 2;
        const cy = rowIndex * (cellH + gapY) + cellH / 2;
        const delay = rowIndex * 0.3 + colIndex * 0.05;

        // Horizontal axon (→ next column, same row)
        if (colIndex + 1 < weeks.length) {
          const neighbor = weeks[colIndex + 1][rowIndex];
          if (!neighbor.isPadding && neighbor.level > 0) {
            result.push({
              x1: cx,
              y1: cy,
              x2: (colIndex + 1) * (cellW + gapX) + cellW / 2,
              y2: cy,
              opacity: 0.08 + ((day.level + neighbor.level) / 8) * 0.18,
              delay,
            });
          }
        }

        // Vertical dendrite (↓ next row, same column)
        if (rowIndex + 1 < week.length) {
          const neighbor = week[rowIndex + 1];
          if (!neighbor.isPadding && neighbor.level > 0) {
            result.push({
              x1: cx,
              y1: cy,
              x2: cx,
              y2: (rowIndex + 1) * (cellH + gapY) + cellH / 2,
              opacity: 0.06 + ((day.level + neighbor.level) / 8) * 0.14,
              delay,
            });
          }
        }
      });
    });

    return result;
  }, [weeks, cellW, cellH, gapX, gapY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="dashboard-theme-toast relative w-full max-w-[800px] overflow-visible px-4"
    >
      <div className="pointer-events-none absolute top-[42%] left-1/2 h-[230px] w-[720px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[75px]" />
      <div className="pointer-events-none absolute top-[88%] left-1/2 h-[180px] w-[640px] -translate-x-1/2 rounded-full bg-blue-400/8 blur-[90px]" />

      <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="relative mx-auto"
          style={{ width: gridW, height: gridH }}
        >
        {/* Neuron synapse lines */}
        <svg
          width={gridW}
          height={gridH}
          className="pointer-events-none absolute inset-0 overflow-visible"
        >
          {connections.map((conn, i) => (
            <motion.line
              key={i}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="rgba(100, 188, 255, 1)"
              strokeWidth={0.7}
              animate={{ opacity: [conn.opacity * 0.5, conn.opacity, conn.opacity * 0.5] }}
              transition={{
                duration: 2.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: conn.delay,
              }}
            />
          ))}
        </svg>

        {weeks.map((week, colIndex) =>
          week.map((day, rowIndex) => {
            const x = colIndex * (cellW + gapX);
            const y = rowIndex * (cellH + gapY);
            const grass = GRASS_COLORS[day.level];
            const dateLabel = new Date(`${day.date}T00:00:00`).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={`${day.date}-${rowIndex}-${colIndex}`}
                className="group absolute"
                style={{ left: x, top: y, width: cellW, height: cellH }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={
                    day.isPadding
                      ? { opacity: 0 }
                      : {
                          scale: [1, 1.45, 1],
                          opacity: [0.65, 1, 0.65],
                        }
                  }
                  transition={
                    day.isPadding
                      ? { duration: 0.2 }
                      : {
                          duration: 2.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: rowIndex * 0.8,
                        }
                  }
                  className="h-full w-full rounded-full border border-white/5"
                  style={{
                    background: day.isPadding ? "transparent" : grass,
                    boxShadow:
                      day.level >= 3
                        ? `0 0 12px ${grass}`
                        : day.level >= 1
                          ? `0 0 6px ${grass}`
                          : "none",
                    opacity: day.isPadding ? 0 : 1,
                  }}
                />
                {!day.isPadding ? (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 hidden -translate-x-1/2 rounded-xl border border-white/10 bg-[#08111b]/95 px-3 py-2 text-[11px] font-medium whitespace-nowrap text-white shadow-2xl backdrop-blur-md group-hover:block">
                    <div>{dateLabel}</div>
                    <div className="mt-0.5 text-blue-300">{day.count} commits</div>
                  </div>
                ) : null}
              </div>
            );
          }),
        )}
      </motion.div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 rounded-full border-none bg-white/5 px-6 py-3 text-[11px] font-semibold tracking-[0.24em] text-blue-100 uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <span className="text-base font-black tracking-normal text-white drop-shadow-md">
            {totalCommits.toLocaleString()}
          </span>
          <span className="text-white/70">커밋</span>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-base font-black tracking-normal text-white drop-shadow-md">
            {bestStreak}
          </span>
          <span className="text-white/70">연속 커밋</span>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-base font-black tracking-normal text-white drop-shadow-md">
            {activeDays}
          </span>
          <span className="text-white/70">활성 일수</span>
        </div>

        <div className="text-[10px] font-semibold tracking-[0.2em] text-white uppercase">
          Last 6 Months Activity
        </div>
      </div>
    </motion.div>
  );
}
