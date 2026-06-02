import { XMLBuilder } from 'fast-xml-parser'
import { siteConfig } from '@/config/site'
import { absoluteUrl, currentYear, toIsoDate } from '@/config/site-utils'
import type { PostMetadata } from '@/features/posts'
import packageJson from '@/../package.json'

const builder = new XMLBuilder({
  attributeNamePrefix: '$',
  cdataPropName: '$',
  format: true,
  ignoreAttributes: false,
  textNodeName: '_',
})

interface AtomEntry {
  id: string
  title: string
  link: { $href: string; $rel: string; $type: string }
  published: string
  updated: string
  author: { name: string }
  summary?: { $type: 'html'; $: string }
  content: { $type: 'html'; $: string }
  category?: Array<{ $term: string }>
}

function renderPreviewContent(post: PostMetadata) {
  const postUrl = absoluteUrl(`/posts/${post.slug}`)
  const parts: string[] = []

  if (post.cover) {
    parts.push(`<img src="${post.cover}" alt="${post.title}" />`)
  }

  if (post.excerpt) {
    parts.push(`<p>${post.excerpt}</p>`)
  }

  parts.push(`<p><a class="view-full" href="${postUrl}">阅读全文</a></p>`)

  return parts.join('')
}

function convertToAtomEntry(post: PostMetadata): AtomEntry {
  const postUrl = absoluteUrl(`/posts/${post.slug}`)
  const date = toIsoDate(post.date)
  const categories = [post.category, ...post.tags]
    .filter((category): category is string => Boolean(category))
    .map(category => ({ $term: category }))

  return {
    id: postUrl,
    title: post.title,
    link: {
      $href: postUrl,
      $rel: 'alternate',
      $type: 'text/html',
    },
    published: date,
    updated: date,
    author: { name: siteConfig.author.name },
    summary: post.excerpt
      ? {
          $type: 'html',
          $: post.excerpt,
        }
      : undefined,
    content: {
      $type: 'html',
      $: renderPreviewContent(post),
    },
    category: categories.length ? categories : undefined,
  }
}

export function buildAtomFeed(posts: PostMetadata[]) {
  const updated = posts[0] ? toIsoDate(posts[0].date) : new Date().toISOString()

  return builder.build({
    '?xml': { $version: '1.0', $encoding: 'UTF-8' },
    '?xml-stylesheet': { $type: 'text/xsl', $href: '/atom.xsl' },
    feed: {
      $xmlns: 'http://www.w3.org/2005/Atom',
      '$xml:lang': siteConfig.locale,
      id: absoluteUrl('/'),
      title: siteConfig.title,
      subtitle: siteConfig.description,
      description: siteConfig.description,
      updated,
      author: {
        name: siteConfig.author.name,
        email: siteConfig.author.email,
        uri: siteConfig.author.url,
      },
      link: [
        { $href: absoluteUrl('/atom.xml'), $rel: 'self', $type: 'application/atom+xml' },
        { $href: absoluteUrl('/'), $rel: 'alternate', $type: 'text/html' },
      ],
      icon: absoluteUrl(siteConfig.assets.favicon),
      logo: absoluteUrl(siteConfig.assets.avatar),
      rights: `© ${siteConfig.copyright.startYear} - ${currentYear()} ${siteConfig.author.name}`,
      generator: {
        $uri: 'https://nextjs.org',
        $version: packageJson.dependencies.next,
        _: 'Next.js',
      },
      entry: posts.map(convertToAtomEntry),
    },
  })
}

export function createAtomResponse(posts: PostMetadata[]) {
  return new Response(buildAtomFeed(posts), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': 'inline; filename="atom.xml"',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Content-Language': siteConfig.locale,
    },
  })
}
