const htmlEntityMap: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
}

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#(\d+)|#x([\da-f]+)|[a-z]+);/gi, (match, entity: string, decimal?: string, hex?: string) => {
    if (decimal || hex) {
      const codePoint = decimal ? Number(decimal) : Number.parseInt(hex || '', 16)
      return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match
    }

    return htmlEntityMap[entity.toLowerCase()] || match
  })
}

export function normalizeEmojiIconSource(value: string) {
  const trimmed = value.trim()
  const candidates = [trimmed, decodeHtmlEntities(trimmed)]

  for (const candidate of candidates) {
    const match = candidate.match(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+))/i)
    const src = match?.[1] || match?.[2] || match?.[3]
    if (src) return decodeHtmlEntities(src).trim()
  }

  return trimmed
}
