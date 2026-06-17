import { XMLParser } from 'fast-xml-parser'

export interface ParsedFeedItem {
  title: string
  link: string
  summary: string
  cover?: string
  pubDate: string
}

const parser = new XMLParser({
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  ignoreAttributes: false,
  textNodeName: '#text',
  trimValues: true,
})

function nodeText(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')

  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>
    if (typeof obj.__cdata === 'string') return obj.__cdata
    if (typeof obj['#text'] === 'string') return obj['#text']
  }

  return ''
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (obj[key] != null && obj[key] !== '') return obj[key]
  }
  return undefined
}

export function stripHtml(html: string): string {
  if (!html) return ''

  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncate(text: string, length: number): string {
  if (!text) return ''

  const chars = Array.from(text)
  if (chars.length <= length) return text

  return `${chars.slice(0, length).join('')}...`
}

function extractFirstImg(html: string): string | undefined {
  if (!html) return undefined

  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
}

function pickAtomLink(link: unknown): string {
  if (!link) return ''
  if (typeof link === 'string') return link

  if (Array.isArray(link)) {
    const alternate = link.find((item) => {
      const rel = (item as Record<string, unknown>)['@_rel']
      return !rel || rel === 'alternate'
    }) as Record<string, unknown> | undefined

    return nodeText(alternate?.['@_href'] ?? (link[0] as Record<string, unknown>)?.['@_href'])
  }

  const obj = link as Record<string, unknown>
  return nodeText(obj['@_href']) || nodeText(obj)
}

function isoDate(input: unknown): string {
  const text = nodeText(input).trim()
  if (!text) return ''

  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function asArray<T>(input: T | T[] | undefined): T[] {
  if (input == null) return []
  return Array.isArray(input) ? input : [input]
}

function pickEnclosureImage(item: Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure
  if (!enclosure) return undefined

  for (const entry of asArray(enclosure as Record<string, unknown> | Record<string, unknown>[])) {
    const type = nodeText(entry['@_type'])
    const url = nodeText(entry['@_url'])

    if (url && (!type || type.startsWith('image/'))) return url
  }

  return undefined
}

export function parseFeedXml(xml: string, limit = 10): ParsedFeedItem[] {
  const root = parser.parse(xml) as Record<string, unknown>
  const rss = root.rss as { channel?: Record<string, unknown> } | undefined

  if (rss?.channel) {
    const channel = rss.channel
    const items = asArray(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined).slice(0, limit)

    return items
      .map((item) => {
        const contentEncoded = nodeText(item['content:encoded'])
        const description = nodeText(item.description)
        const html = contentEncoded || description

        return {
          title: stripHtml(nodeText(item.title)) || '无标题',
          link: nodeText(item.link).trim() || nodeText((item.link as Record<string, unknown> | undefined)?.['@_href']),
          summary: truncate(stripHtml(description || contentEncoded), 200),
          cover:
            pickEnclosureImage(item) ||
            nodeText((item['media:content'] as Record<string, unknown> | undefined)?.['@_url']) ||
            nodeText((item['media:thumbnail'] as Record<string, unknown> | undefined)?.['@_url']) ||
            extractFirstImg(html),
          pubDate: isoDate(pick(item, ['pubDate', 'dc:date', 'pubdate'])),
        }
      })
      .filter(item => item.link)
  }

  const feed = root.feed as Record<string, unknown> | undefined
  if (feed?.entry || feed) {
    const entries = asArray(feed?.entry as Record<string, unknown> | Record<string, unknown>[] | undefined).slice(0, limit)

    return entries
      .map((entry) => {
        const summaryHtml = nodeText(entry.summary)
        const contentHtml = nodeText(entry.content)
        const html = contentHtml || summaryHtml

        return {
          title: stripHtml(nodeText(entry.title)) || '无标题',
          link: pickAtomLink(entry.link),
          summary: truncate(stripHtml(summaryHtml || contentHtml), 200),
          cover:
            nodeText((entry['media:thumbnail'] as Record<string, unknown> | undefined)?.['@_url']) ||
            nodeText((entry['media:content'] as Record<string, unknown> | undefined)?.['@_url']) ||
            extractFirstImg(html),
          pubDate: isoDate(pick(entry, ['published', 'updated'])),
        }
      })
      .filter(item => item.link)
  }

  throw new Error('Unsupported feed format')
}
