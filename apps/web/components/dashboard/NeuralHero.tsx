'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface NeuralHeroProps {
  dailyActivity: Array<{ date: string; count: number }>
  stats: { commits: number; prs: number; reviews: number; issues: number }
  persona: { title: string; headline: string }
  viewer: { login: string; name: string | null }
}

interface NodePoint {
  nx: number
  ny: number
  count: number
  norm: number
  phase: number
  date: string
}

interface Connection {
  ai: number
  bi: number
  baseOpacity: number
}

// Extracted from the exact red outline image
const BRAIN_PATH = 'M 106.703 181.438 L 106.504 181.457 L 105.025 182.122 L 100.705 185.302 M 100.679 185.388 L 98.9093 186.931 L 94.4869 191.406 L 93.229 192.982 L 91.7637 195.025 M 91.4338 195.061 L 90.4414 196.556 L 89.3678 198.42 L 88.1777 200.783 M 88.1769 200.783 L 87.209 205.361 L 86.8289 208.311 L 87.0153 214.019 L 87.609 215.731 L 89.0663 218.986 M 88.9707 219.306 L 89.4804 220.885 L 91.2841 223.283 L 93.6556 226.145 L 93.9818 226.638 M 93.3516 226.321 L 95.41 228.728 L 98.5005 232.745 L 101.623 235.572 L 104.24 236.975 L 106.453 238.306 L 108.612 239.346 L 111.4 240.93 L 113.695 242.477 L 116.708 244.842 L 118.675 246.268 L 119.356 246.483 M 118.779 246.543 L 122.388 248.333 L 127.962 250.317 L 133.839 250.851 L 138.203 251.058 L 146.198 250.971 L 150.861 250.156 L 151.391 249.844 M 149.994 249.906 L 153.091 249.618 L 156.109 249.35 L 158.483 249.027 L 163.925 247.888 L 168.737 246.634 L 172.952 245.678 L 177.831 243.654 L 181.31 241.875 L 184.212 240.895 L 185.667 239.544 L 186.391 239.149 M 181.928 241.751 L 186.19 240.394 L 188.539 238.685 L 193.521 235.878 L 197.53 233.51 L 201.699 229.622 L 204.732 225.645 L 206.393 223.645 L 206.684 223.163 M 206.738 223.589 L 207.744 220.093 L 209.901 215.943 L 211.871 211.39 L 212.198 209.232 L 213.332 203.458 L 214.651 198.306 L 216.686 194.439 L 218.841 190.986 L 219.151 190.476 M 218.688 191.191 L 218.688 191.102 L 219.211 190.061 L 221.859 186.244 M 219.605 190.38 L 221.576 187.426 M 218.859 190.777 L 219.79 189.234 L 221.939 186.566 L 223.582 185.616 L 228.047 182.802 L 231.086 181.534 L 236.561 179.79 L 238.806 179.386 L 243.185 179.749 L 247.814 180.837 L 248.763 181.19 M 248.887 181.251 L 251.875 181.394 L 257.794 181.798 L 261.414 181.967 L 265.738 181.936 L 269.293 181.242 L 272.842 180.576 L 277.511 178.658 L 281.744 175.585 L 284.571 172.19 L 286.898 170.817 L 288.972 167.981 L 291.2 164.527 L 293.342 158.599 L 294.658 156.865 M 295.009 157.567 L 295.396 152.12 L 295.321 146.895 L 294.64 142.208 L 294.422 141.153 M 295.084 141.214 L 294.688 139.529 L 293.229 136.454 L 291.657 133.463 L 289.333 128.835 L 286.855 125.874 L 282.759 123.044 L 282.324 122.52 M 282.324 122.519 L 279.39 120.516 L 275.218 116.958 L 270.658 114.476 L 267.427 112.712 L 262.725 110.475 L 257.456 108.753 L 251.451 108.123 L 241.864 108.026 L 236.657 108.059 L 235.035 108.221 L 234.154 108.244 M 233.756 107.878 L 229.762 107.951 L 225.401 109.112 L 221.637 110.385 L 216.195 113.414 L 212.099 114.828 L 211.579 115.136 L 210.75 115.592 M 210.749 115.591 L 206.128 116.737 L 203.339 119.202 L 200.672 121.175 L 198.048 123.36 L 194.642 126.314 L 190.75 130.308 L 187.553 133.465 L 185.169 136.339 L 182.715 138.749 L 179.457 144.085 L 176.9 146.671 L 176.616 147.448 L 175.766 149.57 M 176.351 147.66 L 175.387 150.965 L 173.172 154.023 L 170.602 159.27 L 168.645 163.242 L 166.792 167.66 L 165.405 171.475 L 164.549 174.16 L 162.715 179.179 L 162.098 182.373 L 161.965 188.128 L 161.694 192.035 L 161.283 194.842 L 161.248 195.539 M 160.485 194.708 L 160.472 197.034 L 159.928 203.297 L 159.886 211.591 L 160.177 215.628 L 161.14 222.996 L 161.425 225.888 M 161.162 227.355 L 163.77 242.375 M 164.154 242.51 L 164.951 245.331 L 167.096 248.791 L 170.243 253.432 L 173.919 258.106 L 175.959 261.079 L 177.562 264.196 L 180.498 271.238 L 182.237 274.555 M 181.313 273.907 L 182.101 276.421 L 184.364 279.804 L 187.272 285.35 L 190.525 290.017 L 192.865 293.225 L 195.814 296.008 L 199.104 298.484 L 202.483 300.286 L 207.593 302.659 L 212.126 303.728 L 213.635 304.075 L 218.933 305.369 L 224.409 306.092 L 225.401 305.922 M 223.641 305.934 L 226.076 305.622 L 230.986 303.14 L 236.05 299.722 L 239.467 297.373 L 242.566 292.374 L 243.137 288.809 L 243.123 285.014 L 242.605 281.247 L 241.134 275.184 L 240.21 271.789 L 239.971 266.157 L 241.048 261.983 L 243.03 257.859 L 245.705 255.934 L 248.104 254.556 L 252.794 254.204 L 258.065 254.839 L 259.032 254.573 M 258.529 254.507 L 262.987 254.445 L 266.019 253.595 L 270.21 252.571 L 272.633 251.675 L 276.278 250.039 L 281.085 247.814 L 283.859 245.906 L 286.361 243.951 L 291.646 239.12 L 294.926 234.512 L 297.386 229.453 L 298.392 224.758 L 298.445 219.168 M 298.1 218.521 L 297.943 212.703 L 297.244 207.725 L 296.744 202.474 L 297.452 199.37 L 299.158 193.841 L 301.157 189.615 L 304.258 184.53 L 306.477 181.587 L 309.219 177.419 L 310.448 172.458 L 312.221 166.419 L 312.497 163.11 L 312.635 157.921 L 312.179 153.857 L 311.388 149.678 L 311.281 148.942 M 311.267 148.842 L 310.251 145.871 L 307.644 141.759 L 305.232 138.62 L 300.943 134.021 L 298.503 131.368 L 295.171 127.377 L 292.018 122.644 L 290.256 118.541 L 289.361 112.456 L 289.049 104.02 L 288.951 101.655 L 288.941 101.245 M 288.811 100.99 L 288.775 97.1097 L 288.315 93.781 L 287.276 88.8435 L 286.955 86.2466 L 285.778 80.3617 L 284.165 75.0397 L 280.983 70.2029 L 278.046 67.1697 L 273.966 63.7138 L 270.158 61.0923 L 268.24 60.3036 L 262.612 57.9108 L 260.409 57.3899 L 254.982 56.6698 L 251.256 56.2613 L 244.228 56.0525 L 242.066 55.6691 L 241.713 55.3662 M 244.113 55.3329 L 240.441 54.8659 L 237.637 52.2639 L 234.849 48.5261 L 232.717 44.5923 L 228.88 40.4902 L 225.95 37.4429 L 222.808 33.7153 L 219.761 30.7574 L 215.178 27.4916 L 209.534 26.0535 L 202.573 26.0321 L 199.329 26.5981 L 193.438 29.166 M 193.776 28.8643 L 189.967 29.7687 L 185.781 31.6089 L 180.854 33.0436 L 175.103 33.5906 L 170.088 31.6275 L 169.276 30.3928 L 169.027 29.9185 M 169.786 31.0446 L 168.352 29.1707 L 165.702 24.3744 L 164.12 20.5017 L 162.573 15.6874 L 160.519 12.137 L 155.266 6.00338 L 150.464 1.94297 L 146.736 1.1549 L 139.978 1.00032 L 135.056 2.48551 L 132.01 4.47764 L 128.405 8.00905 L 125.968 11.0553 L 123.266 13.8483 L 120.307 17.9365 L 117.562 22.7055 L 114.184 26.3033 L 110.559 28.299 L 105.644 28.4038 L 101.965 27.8808 L 98.7773 27.6418 M 98.9221 27.4645 L 95.1819 26.4533 L 91.3524 25.7591 L 85.5323 25.5884 L 81.4932 26.144 L 75.9586 28.0152 L 73.0112 29.0205 L 69.4561 30.3951 L 66.3309 32.1218 L 63.5539 34.3484 L 58.8998 38.0385 L 55.2682 40.7229 L 52.574 43.9793 L 49.1857 48.6779 L 46.3684 52.2029 L 44.2874 55.6324 L 42.6668 60.8131 L 42.5844 61.588 L 42.1973 62.3492 M 42.4872 61.1748 L 41.1535 63.7179 L 39.7135 65.9512 L 37.2893 69.9014 L 35.8817 72.8069 L 34.3279 76.1085 L 32.6826 79.1245 L 30.1949 83.9059 L 24.9715 93.3551 L 22.3284 97.2721 L 20.5552 99.0457 L 15.405 104.085 L 11.3699 108.738 L 8.9362 113.156 L 6.41671 118.54 L 5.92773 119.151 M 6.32181 118.273 L 5.28533 120.733 L 3.66144 123.758 L 2.27463 127.878 L 1.08838 134.019 L 1.45567 139.651 L 2.74558 145.662 L 3.89537 151.768 L 5.13287 155.971 L 7.06046 159.894 L 9.8822 164.916 L 12.8562 168.617 L 14.3757 170.439 M 10.7207 166.61 L 14.3743 170.077 L 16.7442 172.973 L 18.9075 174.909 L 22.784 177.736 L 25.5891 179.599 L 28.5079 181.445 L 33.3256 184.054 L 39.7653 187.057 L 44.407 188.655 L 48.1725 189.535 L 51.8125 190.357 L 54.0837 190.418 M 54.1211 191.134 L 57.0535 191.134 L 68.9099 191.109 L 73.3564 190.967 L 79.328 190.723 L 84.0079 190.113 M 84.0078 190.114 L 87.4675 189.248 L 93.3753 187.581 L 96.0565 186.248 L 101.645 183.714 L 104.911 181.826 L 109.95 178.276 L 113.676 174.509 L 116.135 171.076 L 117.149 169.666 L 117.607 169.215 M 117.837 169.599 L 121.128 164.856 L 124.457 159.835 L 125.615 152.933 L 126.027 140.869 L 125.691 136.311 L 123.59 130.455 L 120.283 125.594 L 117.252 122.423 L 113.297 119.301 L 109.655 117.856 L 102.977 116.127 L 99.2237 115.992 L 92.4163 117.335 L 84.2779 120.041 L 73.4696 124.598 L 68.4782 126.34 L 61.555 127.462 L 53.3503 127.79 L 49.0588 127.103 L 45.2332 124.776 L 44.2812 124.043 M 44.0242 124.285 L 43.0012 121.506 L 42.3429 118.903 L 41.4549 112.712 L 41.443 101.063 L 42.7962 92.7236 L 43.319 87.919 L 43.2759 84.4519 L 42.8878 80.5844 L 42.4648 76.5945 L 42.4625 70.3131 L 42.8735 65.4678 L 43.2849 59.6299 M 98.3574 27.0156 L 102.252 28.0862 L 105.238 30.4835 L 110.7 33.5166 L 112.935 35.0804 L 116.526 38.607 L 118.643 41.7007 L 120.579 45.2012 L 123.296 50.6129 L 124.249 53.6842 L 125.25 58.6753 L 127.044 64.6509 L 129.251 69.2188 L 129.78 70.3331 L 129.947 70.9244 M 129.143 69.9238 L 130.093 73.8179 L 132.251 75.8763 L 135.431 78.6697 L 138.949 81.9497 L 145.181 86.8556 L 151.264 90.0916 L 157.008 91.7819 L 160.595 92.2215 L 166.065 92.128 L 170.971 90.7663 L 174.442 89.0537 L 179.393 87.6086 L 184.295 84.347 L 186.523 83.6472 L 187.145 83.4077 M 186.307 83.5884 L 186.971 83.271 L 191.588 79.6371 L 193.675 77.4985 L 195.822 74.5134 L 197.647 71.1277 L 199.159 67.0789 L 201.109 60.3752 L 202.321 54.1306 L 202.37 49.6649 L 200.864 44.1949 L 198.401 41.2251 L 193.514 38.827 L 189.018 38.3506 L 182.561 38.32 L 175.425 38.5356 L 171.31 38.1612 L 167.619 36.6767 L 165.026 33.1861 L 164.375 29.4295 L 164.042 23.1155 L 163.793 20.1497 L 163.773 18.7168 M 128.365 67.5098 L 128.874 69.0509 L 130.681 71.324 L 132.131 74.2195 L 134.063 77.2756 L 134.679 77.922 L 135.485 78.4042 M 125.242 56.8438 L 122.795 53.4757 L 120.557 51.0986 L 116.474 48.0126 L 110.66 45.638 L 106.079 44.8297 L 99.8724 44.8764 L 97.1104 45.3781 L 95.5135 46.9688 L 92.4402 52.0862 L 89.9724 55.6618 L 88.0551 58.9102 L 85.8022 62.4934 L 83.3343 67.9684 L 83.0215 71.0306 L 83.0834 79.1547 L 84.3396 83.5679 L 86.2644 85.3796 L 91.4448 89.7765 L 96.9199 91.953 L 100.794 92.2955 L 106.296 93.2153 L 111.427 94.8889 L 116.293 97.3127 L 120.245 100.418 L 120.576 100.77 M 120.504 100.698 L 123.074 103.534 L 126.228 106.981 L 129.117 110.836 L 132.368 115.327 L 134.805 119.207 L 138.763 123.017 L 142.687 126.683 L 146.771 131.025 L 150.207 134.959 L 152.109 140.587 L 152.621 144.76 L 153.12 147.199 L 153.213 148.827 M 152.861 141.974 L 152.87 145.328 L 152.861 149.426 L 151.86 153.629 L 149.695 157.472 L 145.877 162.328 L 142.72 166.007 L 138.039 169.409 L 132.217 172.479 L 126.741 174.769 L 123.082 176.076 L 117.442 177.346 L 116.527 177.554 M 116.528 177.554 L 113.615 177.874 L 109.37 179.791 L 105.677 181.462 L 104.739 182.024 L 104.154 182.535'

const PATH_CX = 157
const PATH_CY = 154

const ACCENT = { r: 34, g: 211, b: 238 } // cyan-400
const ACCENT_ALT = { r: 165, g: 243, b: 252 } // cyan-200

// NeuralBloom-style layered stroke palette for the brain outline
const BLOOM_LAYERS: Array<{
  color: string
  alpha: number
  width: number
  scale: number
  dx: number
  dy: number
  rot: number
  phase: number
}> = [
  { color: '255,255,255', alpha: 0.95, width: 1.0, scale: 1.000, dx: 0,    dy: 0,    rot: 0,    phase: 0 },
  { color: '139,242,255', alpha: 0.85, width: 1.2, scale: 1.006, dx: -2,   dy: 1.5,  rot: 0.6,  phase: 1.0 },
  { color: '76,188,255',  alpha: 0.75, width: 1.4, scale: 1.014, dx: 2,    dy: -1.5, rot: -0.8, phase: 2.0 },
  { color: '74,110,255',  alpha: 0.65, width: 1.6, scale: 1.022, dx: -3.5, dy: 2.5,  rot: 1.0,  phase: 3.0 },
  { color: '31,226,208',  alpha: 0.58, width: 1.8, scale: 1.030, dx: 3.5,  dy: -2.5, rot: -1.4, phase: 4.0 },
  { color: '77,140,255',  alpha: 0.50, width: 2.2, scale: 1.038, dx: -5,   dy: 4,    rot: 1.6,  phase: 5.0 },
  { color: '103,232,249', alpha: 0.42, width: 2.6, scale: 1.046, dx: 5,    dy: -4,   rot: -1.8, phase: 6.0 },
]

function pointInBrainShape(x: number, y: number) {
  // Approximate brain bounding using logic suited to the new center
  const ellipse = (x * x) / 1.0 ** 2 + (y * y) / 0.8 ** 2 <= 1
  const upperLeftLobe = ((x + 0.3) ** 2) / 0.5 ** 2 + ((y + 0.1) ** 2) / 0.3 ** 2 <= 1
  const upperRightLobe = ((x - 0.25) ** 2) / 0.55 ** 2 + ((y + 0.05) ** 2) / 0.3 ** 2 <= 1
  const lowerLeftLobe = ((x + 0.25) ** 2) / 0.4 ** 2 + ((y - 0.2) ** 2) / 0.3 ** 2 <= 1
  const lowerRightLobe = ((x - 0.3) ** 2) / 0.35 ** 2 + ((y - 0.15) ** 2) / 0.25 ** 2 <= 1
  const stemCut = x > 0.6 && y > 0.1
  return (ellipse || upperLeftLobe || upperRightLobe || lowerLeftLobe || lowerRightLobe) && !stemCut
}

function buildGridNodes(dailyActivity: Array<{ date: string; count: number }>, maxCount: number) {
  let resolution = 10
  let validPoints: Array<{nx: number, ny: number}> = []

  for(let res = 18; res < 60; res++) {
    validPoints = []
    for(let x = -1.1; x <= 1.1; x += 2/res) {
      for(let y = -0.9; y <= 0.9; y += 2/res) {
        if(pointInBrainShape(x, y)) {
          validPoints.push({nx: x, ny: y})
        }
      }
    }
    if (validPoints.length >= dailyActivity.length) {
      resolution = res
      break
    }
  }

  // GitHub contribution graph sorts by column (weeks) first, then rows (days)
  validPoints.sort((a, b) => {
    if (Math.abs(a.nx - b.nx) > 0.01) return a.nx - b.nx
    return a.ny - b.ny
  })

  let sumX = 0, sumY = 0
  const chosen = validPoints.slice(0, dailyActivity.length)
  chosen.forEach(p => { sumX += p.nx; sumY += p.ny })
  const cx = sumX / chosen.length
  const cy = sumY / chosen.length

  const nodes: NodePoint[] = []
  for (let i = 0; i < dailyActivity.length; i++) {
    const pt = chosen[i]
    const day = dailyActivity[i]
    nodes.push({
      nx: pt.nx - cx,
      ny: pt.ny - cy,
      count: day.count,
      norm: day.count / maxCount,
      phase: (i * 0.618033) % (Math.PI * 2),
      date: day.date,
    })
  }
  return { nodes, spacing: 2/resolution }
}

function buildConnections(nodes: NodePoint[], spacing: number) {
  const connections: Connection[] = []
  const thresh = spacing * 1.5
  
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i].count === 0) continue

    for (let j = i + 1; j < nodes.length; j += 1) {
      if (nodes[j].count === 0) continue

      const dx = nodes[i].nx - nodes[j].nx
      const dy = nodes[i].ny - nodes[j].ny
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > thresh) continue

      const strength = Math.sqrt(nodes[i].norm * nodes[j].norm)
      connections.push({
        ai: i,
        bi: j,
        baseOpacity: strength * 0.6 + 0.1,
      })
    }
  }
  return connections
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function NeuralHero({ dailyActivity, stats, persona, viewer }: NeuralHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const pointerRef = useRef({ x: -1, y: -1, active: false })

  const [brainImg, setBrainImg] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/brain%201.svg'
    img.onload = () => setBrainImg(img)
  }, [])

  const maxCount = useMemo(() => Math.max(...dailyActivity.map(d => d.count), 1), [dailyActivity])
  const activeDays = useMemo(() => dailyActivity.filter(d => d.count > 0).length, [dailyActivity])
  const hottestDay = useMemo(
    () => dailyActivity.reduce((best, day) => (day.count > best.count ? day : best), dailyActivity[0]),
    [dailyActivity],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const { nodes, spacing } = buildGridNodes(dailyActivity, maxCount)
    const connections = buildConnections(nodes, spacing)

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect()
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
        active: true,
      }
    }

    const handlePointerLeave = () => {
      pointerRef.current.active = false
    }

    resize()
    window.addEventListener('resize', resize)
    section.addEventListener('pointermove', handlePointerMove)
    section.addEventListener('pointerleave', handlePointerLeave)

    let t = 0

    const draw = () => {
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      const ox = W * 0.5
      // Center brain below the text
      const oy = H * 0.55
      const scale = Math.min(W * 0.45, H * 0.48)
      const pointer = pointerRef.current
      const px = W * pointer.x
      const py = H * pointer.y
      const nodeSize = scale * spacing * 0.55

      ctx.clearRect(0, 0, W, H)
      t += 0.01

      // Background gradient haze
      const fog = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.4)
      fog.addColorStop(0, 'rgba(34,211,238,0.08)')
      fog.addColorStop(0.48, 'rgba(34,211,238,0.03)')
      fog.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = fog
      ctx.fillRect(0, 0, W, H)

      if (brainImg) {
        ctx.save()
        ctx.translate(ox, oy)

        const imgScale = (scale / 190) * 0.415
        ctx.scale(imgScale, imgScale)

        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 0.35
        ctx.drawImage(brainImg, -brainImg.width / 2, -brainImg.height / 2)
        ctx.restore()
      }

      // ── NEURAL BLOOM LAYERS: brain outline rendered like NeuralBloom ──
      const brainPath = new Path2D(BRAIN_PATH)
      const pathScale = scale / 220

      for (let i = 0; i < BLOOM_LAYERS.length; i += 1) {
        const layer = BLOOM_LAYERS[i]
        ctx.save()
        ctx.translate(ox, oy)

        const animOpacity = layer.alpha * (0.72 + 0.28 * Math.sin(t * 0.6 + layer.phase))
        const animRotate = ((layer.rot + Math.sin(t * 0.25 + layer.phase) * 0.7) * Math.PI) / 180
        ctx.rotate(animRotate)
        const s = pathScale * layer.scale
        ctx.scale(s, s)
        ctx.translate(-PATH_CX + layer.dx, -PATH_CY + layer.dy)

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = `rgba(${layer.color},${animOpacity})`
        ctx.lineWidth = layer.width / s
        ctx.shadowBlur = 6
        ctx.shadowColor = 'rgba(91,224,255,0.35)'
        ctx.stroke(brainPath)

        ctx.restore()
      }

      // ── ONE TRAVELING LIGHT ALONG THE BRAIN OUTLINE ──
      ctx.save()
      ctx.translate(ox, oy)
      ctx.scale(pathScale, pathScale)
      ctx.translate(-PATH_CX, -PATH_CY)

      ctx.lineCap = 'round'
      ctx.setLineDash([0, 1500 / pathScale])
      ctx.lineDashOffset = -(t * 240) / pathScale
      ctx.strokeStyle = `rgba(${ACCENT_ALT.r},${ACCENT_ALT.g},${ACCENT_ALT.b},1)`
      ctx.lineWidth = 14 / pathScale
      ctx.shadowColor = `rgba(${ACCENT_ALT.r},${ACCENT_ALT.g},${ACCENT_ALT.b},1)`
      ctx.shadowBlur = 28
      ctx.stroke(brainPath)
      ctx.setLineDash([])
      ctx.restore()

      let hoveredNode = null

      // Draw Grid Connections
      ctx.lineWidth = 1.2
      for (let index = 0; index < connections.length; index += 1) {
        const connection = connections[index]
        const na = nodes[connection.ai]
        const nb = nodes[connection.bi]
        const ax = ox + na.nx * scale * 1.15
        const ay = oy + na.ny * scale * 1.15
        const bx = ox + nb.nx * scale * 1.15
        const by = oy + nb.ny * scale * 1.15

        const wave = 0.5 + 0.5 * Math.sin(t * 1.5 + na.phase)
        const opacity = connection.baseOpacity * wave * 0.6

        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.strokeStyle = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},${opacity})`
        ctx.stroke()

        // Traveling synapse sparks between grass nodes
        if (index % 7 === 0 && connection.baseOpacity > 0.25) {
          const sparkT = (t * 0.3 + na.phase * 0.1) % 1
          const sx = ax + (bx - ax) * sparkT
          const sy = ay + (by - ay) * sparkT
          const sparkRadius = 1.5 + connection.baseOpacity * 3
          
          ctx.beginPath()
          ctx.arc(sx, sy, sparkRadius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${ACCENT_ALT.r},${ACCENT_ALT.g},${ACCENT_ALT.b},0.9)`
          ctx.shadowBlur = 12
          ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},1)`
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // Draw Nodes (GitHub Grass)
      for (const node of nodes) {
        const x = ox + node.nx * scale * 1.15
        const y = oy + node.ny * scale * 1.15

        const dist = Math.hypot(x - px, y - py)
        const isHovered = pointer.active && dist < nodeSize * 1.5

        if (isHovered && !hoveredNode) {
          hoveredNode = { ...node, x, y }
        }

        let currentSize = nodeSize
        if (isHovered) {
          currentSize = nodeSize * 1.6
        }

        let color, glow = 0
        if (node.count === 0) {
          color = 'rgba(255,255,255,0.06)'
        } else if (node.norm < 0.25) {
          color = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.4)`
          glow = 4
        } else if (node.norm < 0.5) {
          color = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.7)`
          glow = 8
        } else if (node.norm < 0.75) {
          color = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},1)`
          glow = 12
        } else {
          color = `rgba(${ACCENT_ALT.r},${ACCENT_ALT.g},${ACCENT_ALT.b},1)`
          glow = 18
        }

        const pulse = node.count > 0 ? 0.85 + 0.15 * Math.sin(t * 3 + node.phase) : 1
        
        if (glow > 0) {
          ctx.shadowBlur = glow * pulse
          ctx.shadowColor = `rgba(${ACCENT.r},${ACCENT.g},${ACCENT.b},0.8)`
        }

        ctx.fillStyle = color
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(x - currentSize/2, y - currentSize/2, currentSize, currentSize, Math.max(1, currentSize * 0.25))
        } else {
          ctx.rect(x - currentSize/2, y - currentSize/2, currentSize, currentSize)
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Update tooltip DOM directly to avoid React re-renders on hover
      if (tooltipRef.current) {
        if (hoveredNode) {
          tooltipRef.current.style.opacity = '1'
          tooltipRef.current.style.transform = `translate(${hoveredNode.x}px, ${hoveredNode.y - nodeSize * 2 - 10}px) translate(-50%, -100%)`
          
          const textElem = tooltipRef.current.querySelector('div')
          if (textElem) {
            textElem.innerHTML = `<span class="font-bold text-cyan-400">${hoveredNode.count}</span> contributions on <span class="text-cyan-100/70">${formatDateLabel(hoveredNode.date)}</span>`
          }
        } else {
          tooltipRef.current.style.opacity = '0'
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      section.removeEventListener('pointermove', handlePointerMove)
      section.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [dailyActivity, maxCount])

  return (
    <section ref={sectionRef} className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#030508]">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_45%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.03),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#030508_100%)] z-10" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#030508] via-[#030508]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#030508] to-transparent z-10" />

      {/* GIANT TEXT - Shifted UP to sit above the brain */}
      <div className="absolute top-[8vh] inset-x-0 flex flex-col items-center justify-start pointer-events-none z-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="w-full text-center px-4"
        >
          <h2 className="text-[3rem] leading-[0.9] font-black tracking-[-0.04em] text-white/5 md:text-[5.5rem] lg:text-[7.5rem] uppercase mix-blend-screen">
            <span className="font-outline-2 block opacity-70">INSIDE YOUR</span>
            <span className="block mt-2 opacity-90 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]">DEV BRAIN</span>
          </h2>
        </motion.div>
      </div>

      {/* CANVAS - Contains the glowing brain lines & grass grid */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full z-20 pointer-events-auto mix-blend-screen"
        aria-hidden="true"
      />

      {/* TOOLTIP */}
      <div 
        ref={tooltipRef}
        className="pointer-events-none absolute z-50 flex flex-col items-center opacity-0 transition-opacity duration-150 ease-out"
        style={{ top: 0, left: 0 }}
      >
        <div className="bg-[#0a0f18]/90 backdrop-blur-md border border-cyan-400/20 text-white text-[13px] px-3.5 py-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-nowrap" />
        {/* Tooltip Arrow */}
        <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#0a0f18]/90" />
      </div>

      {/* STATS OVERLAY - at the bottom */}
      <div className="absolute bottom-12 left-0 right-0 z-30 pointer-events-none px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap justify-between items-end gap-6 pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-950/40 px-5 py-2.5 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-100">
              Live Neural Activity
            </span>
          </motion.div>

          <div className="flex gap-6 sm:gap-10">
            {[
              { label: '활성화 일수', value: `${activeDays}일` },
              { label: '총 커밋', value: stats.commits.toLocaleString() },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 + i * 0.1, ease: 'easeOut' }}
                className="flex flex-col items-end text-right drop-shadow-lg"
              >
                <div className="text-3xl font-black text-white md:text-4xl">{item.value}</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}