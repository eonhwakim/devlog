export function normalizePositiveInteger(
  value: unknown,
  fallback: number,
  options: { min?: number; max?: number } = {}
): number {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : Number.NaN

  if (!Number.isFinite(parsed)) return fallback

  const rounded = Math.floor(parsed)
  const min = options.min ?? 1
  const max = options.max ?? Number.MAX_SAFE_INTEGER

  if (rounded < min) return min
  if (rounded > max) return max
  return rounded
}

export function normalizeYear(value: unknown, fallback: number): number {
  return normalizePositiveInteger(value, fallback, { min: 2008, max: fallback + 1 })
}
