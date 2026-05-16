const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'this', 'that', 'are', 'was',
  'be', 'have', 'has', 'had', 'do', 'does', 'not', 'as', 'if', 'its',
  '이', '그', '저', '것', '수', '및', '등', '를', '을', '의', '에', '가',
])

export function extractKeywords(text: string, maxKeywords = 8): string[] {
  const freq = new Map<string, number>()

  text
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .forEach(w => freq.set(w, (freq.get(w) ?? 0) + 1))

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)
}
