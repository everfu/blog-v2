import { XMLBuilder } from 'fast-xml-parser'
import { feedEntries } from '@/data/feeds'
import type { FeedEntry } from '@/types/feed'
import { siteConfig } from '@/../blog.config'

const builder = new XMLBuilder({
  attributeNamePrefix: '$',
  format: true,
  ignoreAttributes: false,
})

const absoluteUrl = (pathname: string) => new URL(pathname, siteConfig.url).toString()

function mapEntry(entry: FeedEntry) {
  return {
    $text: entry.title || entry.sitenick || entry.author,
    $type: 'rss',
    $xmlUrl: entry.feed,
    $created: new Date(entry.date).toISOString(),
    $description: entry.desc,
    $htmlUrl: entry.link || entry.feed,
  }
}

export function buildOpml() {
  const outlines = [
    mapEntry({
      author: siteConfig.author.name,
      sitenick: siteConfig.title,
      title: siteConfig.title,
      desc: siteConfig.description,
      link: siteConfig.url,
      feed: absoluteUrl('/atom.xml'),
      icon: absoluteUrl(siteConfig.assets.favicon),
      avatar: absoluteUrl(siteConfig.assets.avatar),
      date: `${siteConfig.copyright.startYear}-01-01`,
    }),
    ...feedEntries.filter(entry => entry.feed).map(mapEntry),
  ]

  return builder.build({
    '?xml': { $version: '1.0', $encoding: 'UTF-8' },
    opml: {
      $version: '2.0',
      head: {
        title: `${siteConfig.title} 的友链订阅`,
        dateCreated: new Date(`${siteConfig.copyright.startYear}-01-01`).toISOString(),
        dateModified: new Date().toISOString(),
        ownerName: siteConfig.author.name,
        ownerEmail: siteConfig.author.email,
        ownerId: siteConfig.author.url,
        docs: 'https://opml.org/spec2.opml',
      },
      body: { outline: outlines },
    },
  })
}

export function createOpmlResponse(filename: 'efu.opml' | 'feeds.opml' = 'feeds.opml') {
  return new Response(buildOpml(), {
    headers: {
      'Content-Type': 'text/x-opml; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Language': siteConfig.locale,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
