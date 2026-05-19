'use client'

import { motion } from 'framer-motion'

const BLOOM_PATH =
  'M319.2 123.5c34.6-27.9 81.1-36.4 118.3-15.6 37.2 20.8 59.4 66.1 57.3 109.2-2.1 43.1-28.6 84-19.4 124.9 9.2 40.9 54.2 81.7 46.3 121.5-7.9 39.8-68.7 78.7-122.9 86.7-54.2 8-101.9-15-140.9-10.6-39 4.4-69.4 36.1-109.3 41.4-39.9 5.3-89.3-15.8-111.9-54.4-22.6-38.6-18.3-94.8-32.5-136.2-14.2-41.4-47-68-52.5-106.8-5.5-38.8 16.3-89.8 53.4-117.9 37.1-28.1 89.5-33.3 130.8-45.5 41.3-12.2 71.5-31.3 100.4-36.7 28.9-5.4 48.4 67.9 83 40z'

const layerPalette = [
  'rgba(255,255,255,0.95)',
  'rgba(139,242,255,0.92)',
  'rgba(76,188,255,0.82)',
  'rgba(74,110,255,0.72)',
  'rgba(31,226,208,0.68)',
  'rgba(77,140,255,0.62)',
  'rgba(103,232,249,0.58)',
]

export function NeuralBloom() {
  const layers = Array.from({ length: 14 }, (_, index) => ({
    id: index,
    scale: 0.78 + index * 0.032,
    x: (index % 2 === 0 ? -1 : 1) * index * 2.6,
    y: (index % 3 === 0 ? -1 : 1) * index * 1.9,
    rotate: -12 + index * 1.8,
    opacity: 1 - index * 0.045,
    color: layerPalette[index % layerPalette.length],
    duration: 10 + index * 0.7,
  }))

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 2, 0, -2, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        className="relative h-[420px] w-[420px] md:h-[520px] md:w-[520px] lg:h-[620px] lg:w-[620px]"
      >
        <div className="absolute inset-[16%] rounded-full bg-cyan-300/10 blur-[90px]" />
        <div className="absolute inset-[24%] rounded-full bg-blue-500/16 blur-[110px]" />

        <svg
          viewBox="0 0 640 640"
          className="absolute inset-0 h-full w-full overflow-visible translate-x-[3%] md:translate-x-[4%]"
          fill="none"
          aria-hidden="true"
        >
          {layers.map(layer => (
            <motion.path
              key={layer.id}
              d={BLOOM_PATH}
              stroke={layer.color}
              strokeWidth={1.8}
              strokeLinecap="round"
              transform={`translate(${layer.x} ${layer.y}) scale(${layer.scale}) rotate(${layer.rotate} 320 320)`}
              style={{ opacity: layer.opacity, filter: 'drop-shadow(0 0 8px rgba(91,224,255,0.18))' }}
              animate={{
                opacity: [layer.opacity * 0.72, layer.opacity, layer.opacity * 0.72],
                rotate: [layer.rotate, layer.rotate + 1.8, layer.rotate - 1.4, layer.rotate],
              }}
              transition={{
                duration: layer.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>

        <motion.div
          animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.94, 1.04, 0.94] }}
          transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-white/[0.03] blur-[1px]"
        />
      </motion.div>
    </div>
  )
}
