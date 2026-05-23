"use client";

import { motion, useReducedMotion } from "framer-motion";
import type React from "react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

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

interface NeuralGrassProps {
  dailyActivity: Array<{ date: string; count: number }>;
  summaryCards: Array<{ label: string; value: string }>;
  weeklyData?: WeeklyData | null;
}

const BRAIN_PATH =
  "M106.703 181.438L106.504 181.457L105.025 182.122L100.705 185.302L98.909 186.931L94.487 191.406L93.229 192.982L91.764 195.025L90.441 196.556L89.368 198.42L88.177 200.783L87.209 205.361L86.829 208.311L87.015 214.019L87.609 215.731L89.066 218.986L89.48 220.885L91.284 223.283L93.656 226.145L95.41 228.728L98.501 232.745L101.623 235.572L104.24 236.975L106.453 238.306L108.612 239.346L111.4 240.93L113.695 242.477L116.708 244.842L118.675 246.268L122.388 248.333L127.962 250.317L133.839 250.851L138.203 251.058L146.198 250.971L150.861 250.156L153.091 249.618L156.109 249.35L158.483 249.027L163.925 247.888L168.737 246.634L172.952 245.678L177.831 243.654L181.31 241.875L184.212 240.895L185.667 239.544L186.19 240.394L188.539 238.685L193.521 235.878L197.53 233.51L201.699 229.622L204.732 225.645L206.393 223.645L207.744 220.093L209.901 215.943L211.871 211.39L212.198 209.232L213.332 203.458L214.651 198.306L216.686 194.439L218.841 190.986L219.211 190.061L221.859 186.244L223.582 185.616L228.047 182.802L231.086 181.534L236.561 179.79L238.806 179.386L243.185 179.749L247.814 180.837L251.875 181.394L257.794 181.798L261.414 181.967L265.738 181.936L269.293 181.242L272.842 180.576L277.511 178.658L281.744 175.585L284.571 172.19L286.898 170.817L288.972 167.981L291.2 164.527L293.342 158.599L295.396 152.12L295.321 146.895L294.64 142.208L294.688 139.529L293.229 136.454L291.657 133.463L289.333 128.835L286.855 125.874L282.759 123.044L279.39 120.516L275.218 116.958L270.658 114.476L267.427 112.712L262.725 110.475L257.456 108.753L251.451 108.123L241.864 108.026L236.657 108.059L235.035 108.221L229.762 107.951L225.401 109.112L221.637 110.385L216.195 113.414L212.099 114.828L210.75 115.592L206.128 116.737L203.339 119.202L200.672 121.175L198.048 123.36L194.642 126.314L190.75 130.308L187.553 133.465L185.169 136.339L182.715 138.749L179.457 144.085L176.9 146.671L175.766 149.57L175.387 150.965L173.172 154.023L170.602 159.27L168.645 163.242L166.792 167.66L165.405 171.475L164.549 174.16L162.715 179.179L162.098 182.373L161.965 188.128L161.694 192.035L161.283 194.842L160.472 197.034L159.928 203.297L159.886 211.591L160.177 215.628L161.14 222.996L163.77 242.375L164.951 245.331L167.096 248.791L170.243 253.432L173.919 258.106L175.959 261.079L177.562 264.196L180.498 271.238L182.101 276.421L184.364 279.804L187.272 285.35L190.525 290.017L192.865 293.225L195.814 296.008L199.104 298.484L202.483 300.286L207.593 302.659L212.126 303.728L218.933 305.369L224.409 306.092L226.076 305.622L230.986 303.14L236.05 299.722L239.467 297.373L242.566 292.374L243.137 288.809L243.123 285.014L242.605 281.247L241.134 275.184L240.21 271.789L239.971 266.157L241.048 261.983L243.03 257.859L245.705 255.934L248.104 254.556L252.794 254.204L258.065 254.839L262.987 254.445L266.019 253.595L270.21 252.571L272.633 251.675L276.278 250.039L281.085 247.814L283.859 245.906L286.361 243.951L291.646 239.12L294.926 234.512L297.386 229.453L298.392 224.758L297.943 212.703L297.244 207.725L296.744 202.474L297.452 199.37L299.158 193.841L301.157 189.615L304.258 184.53L306.477 181.587L309.219 177.419L310.448 172.458L312.221 166.419L312.497 163.11L312.635 157.921L312.179 153.857L311.388 149.678L310.251 145.871L307.644 141.759L305.232 138.62L300.943 134.021L298.503 131.368L295.171 127.377L292.018 122.644L290.256 118.541L289.361 112.456L289.049 104.02L288.775 97.11L287.276 88.844L286.955 86.247L285.778 80.362L284.165 75.04L280.983 70.203L278.046 67.17L273.966 63.714L270.158 61.092L268.24 60.304L262.612 57.911L260.409 57.39L254.982 56.67L251.256 56.261L244.228 56.053L240.441 54.866L237.637 52.264L234.849 48.526L232.717 44.592L228.88 40.49L225.95 37.443L222.808 33.715L219.761 30.757L215.178 27.492L209.534 26.054L202.573 26.032L199.329 26.598L193.438 29.166L189.967 29.769L185.781 31.609L180.854 33.044L175.103 33.591L170.088 31.627L168.352 29.171L165.702 24.374L164.12 20.502L162.573 15.687L160.519 12.137L155.266 6.003L150.464 1.943L146.736 1.155L139.978 1L135.056 2.486L132.01 4.478L128.405 8.009L125.968 11.055L123.266 13.848L120.307 17.936L117.562 22.706L114.184 26.303L110.559 28.299L105.644 28.404L101.965 27.881L95.182 26.453L91.352 25.759L85.532 25.588L81.493 26.144L75.959 28.015L73.011 29.021L69.456 30.395L66.331 32.122L63.554 34.348L58.9 38.039L55.268 40.723L52.574 43.979L49.186 48.678L46.368 52.203L44.287 55.632L42.667 60.813L42.197 62.349L41.154 63.718L39.714 65.951L37.289 69.901L35.882 72.807L34.328 76.108L32.683 79.124L30.195 83.906L24.972 93.355L22.328 97.272L20.555 99.046L15.405 104.085L11.37 108.738L8.936 113.156L6.417 118.54L5.285 120.733L3.661 123.758L2.275 127.878L1.088 134.019L1.456 139.651L2.746 145.662L3.895 151.768L5.133 155.971L7.06 159.894L9.882 164.916L14.374 170.077L16.744 172.973L18.908 174.909L22.784 177.736L25.589 179.599L28.508 181.445L33.326 184.054L39.765 187.057L44.407 188.655L48.173 189.535L51.813 190.357L57.053 191.134L68.91 191.109L73.356 190.967L79.328 190.723L84.008 190.114L87.467 189.248L93.375 187.581L96.057 186.248L101.645 183.714L104.911 181.826L109.95 178.276L113.676 174.509L116.135 171.076L117.607 169.215L121.128 164.856L124.457 159.835L125.615 152.933L126.027 140.869L125.691 136.311L123.59 130.455L120.283 125.594L117.252 122.423L113.297 119.301L109.655 117.856L102.977 116.127L99.224 115.992L92.416 117.335L84.278 120.041L73.47 124.598L68.478 126.34L61.555 127.462L53.35 127.79L49.059 127.103L45.233 124.776L43.001 121.506L42.343 118.903L41.455 112.712L41.443 101.063L42.796 92.724L43.319 87.919L43.276 84.452L42.888 80.584L42.465 76.594L42.463 70.313L42.874 65.468L43.285 59.63L98.357 27.016L102.252 28.086L105.238 30.484L110.7 33.517L112.935 35.08L116.526 38.607L118.643 41.701L120.579 45.201L123.296 50.613L124.249 53.684L125.25 58.675L127.044 64.651L129.251 69.219L130.093 73.818L132.251 75.876L135.431 78.67L138.949 81.95L145.181 86.856L151.264 90.092L157.008 91.782L160.595 92.221L166.065 92.128L170.971 90.766L174.442 89.054L179.393 87.609L184.295 84.347L186.971 83.271L191.588 79.637L193.675 77.499L195.822 74.513L197.647 71.128L199.159 67.079L201.109 60.375L202.321 54.131L202.37 49.665L200.864 44.195L198.401 41.225L193.514 38.827L189.018 38.351L182.561 38.32L175.425 38.536L171.31 38.161L167.619 36.677L165.026 33.186L164.375 29.429L164.042 23.116L163.773 18.717L128.874 69.051L130.681 71.324L132.131 74.22L134.063 77.276L135.485 78.404L122.795 53.476L120.557 51.099L116.474 48.013L110.66 45.638L106.079 44.83L99.872 44.876L97.11 45.378L95.514 46.969L92.44 52.086L89.972 55.662L88.055 58.91L85.802 62.493L83.334 67.968L83.022 71.031L83.083 79.155L84.34 83.568L86.264 85.38L91.445 89.777L96.92 91.953L100.794 92.295L106.296 93.215L111.427 94.889L116.293 97.313L120.245 100.418L123.074 103.534L126.228 106.981L129.117 110.836L132.368 115.327L134.805 119.207L138.763 123.017L142.687 126.683L146.771 131.025L150.207 134.959L152.109 140.587L152.87 145.328L152.861 149.426L151.86 153.629L149.695 157.472L145.877 162.328L142.72 166.007L138.039 169.409L132.217 172.479L126.741 174.769L123.082 176.076L117.442 177.346L113.615 177.874L109.37 179.791L105.677 181.462L104.154 182.535";

const PATH_CENTER_X = 157;
const PATH_CENTER_Y = 154;

const NODE_COUNT = 168;

const BRAIN_OUTLINE_POINTS: Array<{ x: number; y: number }> = (() => {
  const out: Array<{ x: number; y: number }> = [];
  const segments = BRAIN_PATH.replace(/^M/, "").split(/L/);
  for (const seg of segments) {
    const parts = seg.trim().split(/\s+/);
    if (parts.length >= 2) {
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y });
    }
  }
  return out;
})();

function pseudo(seed: number): number {
  const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

interface Neuron {
  id: number;
  x: number;
  y: number;
  startDate: string;
  endDate: string;
  count: number;
  intensity: number;
}

interface Synapse {
  a: number;
  b: number;
}

interface Triangle {
  a: number;
  b: number;
  c: number;
}

interface PulseCluster {
  a: number;
  b: number;
  c: number;
  points: string;
  cx: number;
  cy: number;
  peakOpacity: number;
  delay: number;
  duration: number;
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function neuronVisual(n: Neuron) {
  const inactive = n.intensity === 0;
  return {
    radius: inactive ? 1.0 : 1.4 + n.intensity * 2.2,
    fill: inactive ? "rgba(160,210,255,0.65)" : "rgba(225,245,255,1)",
    opacity: inactive ? 0.42 : 0.58 + n.intensity * 0.38,
    glowFilter: inactive
      ? "url(#neural-neuron-glow-soft)"
      : n.intensity > 0.45
        ? "url(#neural-neuron-glow-strong)"
        : "url(#neural-neuron-glow)",
    haloRadius: inactive ? 0 : 1.8 + n.intensity * 3.2,
    haloOpacity: inactive ? 0 : 0.12 + n.intensity * 0.22,
  };
}

export function NeuralGrass({ dailyActivity, summaryCards, weeklyData }: NeuralGrassProps) {
  const [fullText, setFullText] = useState(""); // 완전히 받아온 원문
  const [displayed, setDisplayed] = useState(""); // 타이핑 중인 텍스트
  const [isFetched, setIsFetched] = useState(false);
  const fetchedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef(0);
  const CHAR_INTERVAL = 30; // ms per character
  const CLIENT_CACHE_TTL = 60 * 60 * 1000; // 1시간

  // localStorage 캐시 확인 → 없으면 API 호출
  useEffect(() => {
    if (!weeklyData || fetchedRef.current) return;
    fetchedRef.current = true;

    // ── 1. 클라이언트 캐시 확인 ──────────────────────────────────────────
    const cacheKey = `devlog_claude_weekly_${weeklyData.period.from}`;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { text, ts } = JSON.parse(raw) as { text: string; ts: number };
        if (text && Date.now() - ts < CLIENT_CACHE_TTL) {
          setFullText(text);
          setIsFetched(true);
          return; // API 호출 없이 캐시 사용
        }
      }
    } catch {}

    // ── 2. 캐시 미스 → 서버에 요청 ──────────────────────────────────────
    const ctrl = new AbortController();
    fetch("/api/claude/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weeklyData),
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;

        // 로컬 캐시에 저장 + 이전 주 캐시 정리
        try {
          for (const k of Object.keys(localStorage)) {
            if (k.startsWith("devlog_claude_weekly_") && k !== cacheKey) {
              localStorage.removeItem(k);
            }
          }
          localStorage.setItem(cacheKey, JSON.stringify({ text, ts: Date.now() }));
        } catch {}

        setFullText(text);
        setIsFetched(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => ctrl.abort();
  }, [weeklyData]);

  // rAF 타이핑: fullText 도착 후 한 글자씩 출력
  useEffect(() => {
    if (!isFetched || !fullText) return;
    let pos = 0;
    lastTickRef.current = 0;

    function tick(now: number) {
      if (lastTickRef.current === 0) lastTickRef.current = now;
      const elapsed = now - lastTickRef.current;
      const steps = Math.floor(elapsed / CHAR_INTERVAL);
      if (steps > 0) {
        pos = Math.min(pos + steps, fullText.length);
        setDisplayed(fullText.slice(0, pos));
        lastTickRef.current = now;
      }
      if (pos < fullText.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isFetched, fullText]);

  const weeklyHighlight = weeklyData?.stats ?? null;
  const reduceMotion = useReducedMotion();

  const neurons = useMemo<Neuron[]>(() => {
    if (BRAIN_OUTLINE_POINTS.length === 0) return [];
    const sorted = (dailyActivity ?? []).slice().sort((a, b) => a.date.localeCompare(b.date));
    const outlineCount = BRAIN_OUTLINE_POINTS.length;

    const buckets = Array.from({ length: NODE_COUNT }, (_, i) => {
      if (sorted.length === 0) {
        return { startDate: "", endDate: "", count: 0 };
      }
      const from = Math.floor((i * sorted.length) / NODE_COUNT);
      const to = Math.floor(((i + 1) * sorted.length) / NODE_COUNT);
      const slice = sorted.slice(from, Math.max(to, from + 1));
      return {
        startDate: slice[0]?.date ?? "",
        endDate: slice[slice.length - 1]?.date ?? "",
        count: slice.reduce((s, d) => s + d.count, 0),
      };
    });
    const maxCount = Math.max(1, ...buckets.map((b) => b.count));

    return buckets.map((b, i) => {
      const outlineIdx = Math.floor((i * outlineCount) / NODE_COUNT) % outlineCount;
      const op = BRAIN_OUTLINE_POINTS[outlineIdx];
      const ringSeed = pseudo(i * 7.3 + 1);
      let ratio: number;
      if (ringSeed < 0.32) ratio = 0.98;
      else if (ringSeed < 0.58) ratio = 0.78;
      else if (ringSeed < 0.77) ratio = 0.58;
      else if (ringSeed < 0.91) ratio = 0.4;
      else ratio = 0.22;
      const jx = (pseudo(i * 2.1) - 0.5) * 9;
      const jy = (pseudo(i * 2.1 + 0.5) - 0.5) * 9;
      return {
        id: i,
        x: PATH_CENTER_X + (op.x - PATH_CENTER_X) * ratio + jx,
        y: PATH_CENTER_Y + (op.y - PATH_CENTER_Y) * ratio + jy,
        startDate: b.startDate,
        endDate: b.endDate,
        count: b.count,
        intensity: b.count / maxCount,
      };
    });
  }, [dailyActivity]);

  const synapses = useMemo<Synapse[]>(() => {
    if (neurons.length === 0) return [];
    const k = 5;
    const seen = new Set<number>();
    const out: Synapse[] = [];
    for (let i = 0; i < neurons.length; i++) {
      const dists: Array<{ j: number; d: number }> = [];
      for (let j = 0; j < neurons.length; j++) {
        if (j === i) continue;
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        dists.push({ j, d: dx * dx + dy * dy });
      }
      dists.sort((a, b) => a.d - b.d);
      for (const c of dists.slice(0, k)) {
        const a = Math.min(i, c.j);
        const b = Math.max(i, c.j);
        const key = a * 100000 + b;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ a, b });
        }
      }
    }
    return out;
  }, [neurons]);

  const triangles = useMemo<Triangle[]>(() => {
    if (synapses.length === 0) return [];
    const adj = new Map<number, Set<number>>();
    for (const { a, b } of synapses) {
      if (!adj.has(a)) adj.set(a, new Set());
      if (!adj.has(b)) adj.set(b, new Set());
      adj.get(a)!.add(b);
      adj.get(b)!.add(a);
    }
    const out: Triangle[] = [];
    const seen = new Set<string>();
    for (const { a, b } of synapses) {
      const na = adj.get(a);
      const nb = adj.get(b);
      if (!na || !nb) continue;
      for (const c of na) {
        if (c === a || c === b) continue;
        if (!nb.has(c)) continue;
        const v = [a, b, c].sort((x, y) => x - y);
        const key = `${v[0]}-${v[1]}-${v[2]}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ a: v[0], b: v[1], c: v[2] });
        }
      }
    }
    return out;
  }, [synapses]);

  const pulseClusters = useMemo<PulseCluster[]>(() => {
    if (triangles.length === 0) return [];
    const weighted = triangles.map((t, i) => ({ t, w: pseudo(i * 3.71 + 0.13) }));
    weighted.sort((a, b) => b.w - a.w);
    const take = Math.min(18, weighted.length);
    return weighted.slice(0, take).map(({ t }, i) => {
      const A = neurons[t.a];
      const B = neurons[t.b];
      const C = neurons[t.c];
      const intensity = (A.intensity + B.intensity + C.intensity) / 3;
      return {
        a: t.a,
        b: t.b,
        c: t.c,
        points: `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`,
        cx: (A.x + B.x + C.x) / 3,
        cy: (A.y + B.y + C.y) / 3,
        peakOpacity: 0.18 + intensity * 0.28,
        delay: pseudo(i * 11.31 + 2.7) * 9,
        duration: 2.6 + pseudo(i * 7.93 + 0.9) * 2.6,
      };
    });
  }, [triangles, neurons]);

  const pulseNeuronIds = useMemo(() => {
    const ids = new Set<number>();
    for (const cluster of pulseClusters) {
      ids.add(cluster.a);
      ids.add(cluster.b);
      ids.add(cluster.c);
    }
    return ids;
  }, [pulseClusters]);

  const pulseEdgeKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const cluster of pulseClusters) {
      keys.add(edgeKey(cluster.a, cluster.b));
      keys.add(edgeKey(cluster.b, cluster.c));
      keys.add(edgeKey(cluster.c, cluster.a));
    }
    return keys;
  }, [pulseClusters]);

  const globalIntensity = useMemo(() => {
    if (neurons.length === 0) return 0;
    return neurons.reduce((sum, n) => sum + n.intensity, 0) / neurons.length;
  }, [neurons]);

  const breathDuration = Math.max(6, 8 - globalIntensity * 2);

  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ neuron: Neuron; x: number; y: number } | null>(null);

  const handleEnter = (e: React.PointerEvent<SVGCircleElement>, n: Neuron) => {
    const c = e.currentTarget.getBoundingClientRect();
    const p = containerRef.current?.getBoundingClientRect();
    if (!p) return;
    setHover({
      neuron: n,
      x: c.left - p.left + c.width / 2,
      y: c.top - p.top,
    });
  };
  const handleLeave = () => setHover(null);

  const formatDate = (iso: string) =>
    iso
      ? new Date(`${iso}T00:00:00`).toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";
  const hoverDateLabel = hover
    ? hover.neuron.startDate && hover.neuron.endDate
      ? hover.neuron.startDate === hover.neuron.endDate
        ? formatDate(hover.neuron.startDate)
        : `${formatDate(hover.neuron.startDate)} ~ ${formatDate(hover.neuron.endDate)}`
      : "데이터 없음"
    : "";

  return (
    <div className="pointer-events-none flex w-full flex-col items-center">
      <div ref={containerRef} className="relative flex items-center justify-center">
        <div
          className={`neural-grass-brain mix-blend-screen ${reduceMotion ? "" : "neural-grass-brain--animate"}`}
          style={{ "--neural-breath-duration": `${breathDuration}s` } as React.CSSProperties}
        >
          <div className="neural-grass-glow" aria-hidden="true" />

          <svg
            viewBox="0 0 314 308"
            className="absolute inset-0 h-full w-full overflow-visible"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="neural-neuron-glow-soft" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="neural-neuron-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="neural-neuron-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              className={reduceMotion ? undefined : "neural-grass-outline"}
              d={BRAIN_PATH}
              stroke="rgba(123,215,255,0.55)"
              strokeWidth={0.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <g stroke="rgba(170,230,255,1)" strokeWidth={0.6} strokeLinecap="round">
              {synapses.map((s) => {
                const key = edgeKey(s.a, s.b);
                if (!reduceMotion && pulseEdgeKeys.has(key)) return null;
                const na = neurons[s.a];
                const nb = neurons[s.b];
                const combined = (na.intensity + nb.intensity) / 2;
                const baseOpacity = 0.15 + combined * 0.42;
                return (
                  <line
                    key={`s-${key}`}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    strokeOpacity={baseOpacity}
                  />
                );
              })}
            </g>

            <g>
              {neurons.map((n) => {
                if (!reduceMotion && pulseNeuronIds.has(n.id)) return null;
                const vis = neuronVisual(n);
                return (
                  <g key={`n-${n.id}`} filter={vis.glowFilter}>
                    {vis.haloRadius > 0 ? (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={vis.haloRadius}
                        fill="rgba(123,215,255,1)"
                        opacity={vis.haloOpacity}
                      />
                    ) : null}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={vis.radius}
                      fill={vis.fill}
                      opacity={vis.opacity}
                    />
                  </g>
                );
              })}
            </g>

            {!reduceMotion &&
              pulseClusters.map((cluster, i) => {
                const A = neurons[cluster.a];
                const B = neurons[cluster.b];
                const C = neurons[cluster.c];
                const visA = neuronVisual(A);
                const visB = neuronVisual(B);
                const visC = neuronVisual(C);
                const pulseTransition = {
                  duration: cluster.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut" as const,
                  delay: cluster.delay,
                };
                const polyPeak = 0.12 + cluster.peakOpacity * 0.38;
                const linePeak = 0.22 + cluster.peakOpacity * 0.45;
                const nodePeak = 0.42 + cluster.peakOpacity * 0.35;
                const edges: Array<[Neuron, Neuron]> = [
                  [A, B],
                  [B, C],
                  [C, A],
                ];
                return (
                  <motion.g
                    key={`pulse-${i}`}
                    style={{
                      transformOrigin: `${cluster.cx}px ${cluster.cy}px`,
                      transformBox: "fill-box",
                    }}
                    animate={{ scale: [0.92, 1.14, 0.92] }}
                    transition={pulseTransition}
                  >
                    <motion.polygon
                      points={cluster.points}
                      fill="rgba(140,220,255,0.75)"
                      animate={{ opacity: [0.06, polyPeak, 0.06] }}
                      transition={pulseTransition}
                    />
                    <g stroke="rgba(180,228,255,0.9)" strokeWidth={0.75} strokeLinecap="round">
                      {edges.map(([from, to], ei) => (
                        <motion.line
                          key={`pe-${ei}`}
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          animate={{ strokeOpacity: [0.1, linePeak, 0.1] }}
                          transition={pulseTransition}
                        />
                      ))}
                    </g>
                    {[A, B, C].map((node, vi) => {
                      const vis = [visA, visB, visC][vi];
                      return (
                        <motion.circle
                          key={`pn-${vi}`}
                          cx={node.x}
                          cy={node.y}
                          r={vis.radius}
                          fill={vis.fill}
                          filter="url(#neural-neuron-glow)"
                          animate={{ opacity: [0.38, nodePeak, 0.38] }}
                          transition={pulseTransition}
                        />
                      );
                    })}
                  </motion.g>
                );
              })}

            {neurons.map((n) => (
              <circle
                key={`hit-${n.id}`}
                cx={n.x}
                cy={n.y}
                r={6}
                fill="transparent"
                style={{ pointerEvents: "all", cursor: "pointer" }}
                onPointerEnter={(e) => handleEnter(e, n)}
                onPointerLeave={handleLeave}
              />
            ))}
          </svg>
        </div>

        {hover ? (
          <div
            className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-xl border border-white/10 bg-[#08111b]/95 px-3 py-2 text-[11px] font-medium whitespace-nowrap text-white shadow-2xl backdrop-blur-md"
            style={{ left: hover.x, top: hover.y - 10 }}
          >
            <div>{hoverDateLabel}</div>
            <div className="mt-0.5 text-blue-300">
              {hover.neuron.count > 0 ? `${hover.neuron.count}회 기여` : "활동 없음"}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── chips + Claude 해석: absolute 밖으로 꺼내 일반 flow ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
        className="pointer-events-auto -mt-40 flex flex-col items-center gap-2 pb-10"
      >
        {weeklyHighlight ? (
          <>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-white/35 uppercase">
              이번 주 하이라이트
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/35 px-6 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {[
                { label: "커밋", value: weeklyHighlight.commits, color: "text-cyan-300" },
                { label: "PR", value: weeklyHighlight.prs, color: "text-blue-300" },
                { label: "리뷰", value: weeklyHighlight.reviews, color: "text-violet-300" },
                { label: "이슈", value: weeklyHighlight.issues, color: "text-emerald-300" },
              ].map((item, idx) => (
                <Fragment key={item.label}>
                  {idx > 0 && <span className="h-5 w-px bg-white/10" />}
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={`text-xl leading-none font-black tracking-tight ${item.color} drop-shadow-[0_0_8px_currentColor]`}
                    >
                      {item.value}
                    </span>
                    <span className="text-[10px] font-medium tracking-wider text-white/45">
                      {item.label}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>

            {/* Claude 해석 — 타이핑 모션 */}
            {(displayed || isFetched) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-1 w-[540px] rounded-2xl border border-white/6 bg-black/30 px-5 py-3.5 backdrop-blur-xl"
              >
                {displayed ? (
                  <p className="text-center text-[12px] leading-[1.75] text-white/50">
                    {displayed}
                    {displayed.length < fullText.length && (
                      <span className="ml-0.5 inline-block h-[13px] w-[2px] animate-[blink_0.7s_step-end_infinite] rounded-full bg-violet-400 align-middle" />
                    )}
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {[70, 90, 55].map((w, i) => (
                      <div
                        key={i}
                        className="h-2 animate-pulse rounded-full bg-white/8"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4 rounded-full border-none bg-white/5 px-6 py-3 text-[11px] font-semibold tracking-[0.24em] text-blue-100 uppercase shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
            {summaryCards.map((card, idx) => (
              <Fragment key={card.label}>
                {idx > 0 && <span className="h-4 w-px bg-white/20" />}
                <span className="text-base font-black tracking-normal text-white drop-shadow-md">
                  {card.value}
                </span>
                <span className="text-white/70">{card.label}</span>
              </Fragment>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
