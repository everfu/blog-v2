import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { siteConfig } from '@/config/site'

const postsDirectory = path.join(process.cwd(), 'content/posts')
const DEFAULT_POST_DATE = `${siteConfig.copyright.startYear}-01-01`
const DEFAULT_CATEGORY = 'DAILY'

export interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  cover?: string
  category: string
  recent: boolean
  content: string
}

export interface PostMetadata {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  cover?: string
  category: string
  recent: boolean
}

type PostFrontmatter = {
  title?: unknown
  date?: unknown
  excerpt?: unknown
  tags?: unknown
  cover?: unknown
  category?: unknown
  recent?: unknown
}

const isPostFile = (fileName: string) => {
  const isMarkdown = fileName.endsWith('.md') || fileName.endsWith('.mdx')
  const isNotReadme = !fileName.toLowerCase().startsWith('readme')

  return isMarkdown && isNotReadme
}

const getSlugFromFileName = (fileName: string) => fileName.replace(/\.(md|mdx)$/, '')

const asString = (value: unknown, fallback = '') =>
  typeof value === 'string' && value.trim() ? value : fallback

const normalizeTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []

  return value
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => tag.trim())
    .filter(Boolean)
}

const normalizeDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  if (typeof value === 'string' && !Number.isNaN(new Date(value).getTime())) {
    return value
  }

  return DEFAULT_POST_DATE
}

const createExcerpt = (frontmatterExcerpt: unknown, content: string) =>
  asString(frontmatterExcerpt, `${content.trim().slice(0, 150)}...`)

function normalizePost(slug: string, frontmatter: PostFrontmatter, content: string): Post {
  return {
    slug,
    title: asString(frontmatter.title, slug),
    date: normalizeDate(frontmatter.date),
    excerpt: createExcerpt(frontmatter.excerpt, content),
    tags: normalizeTags(frontmatter.tags),
    cover: asString(frontmatter.cover) || undefined,
    category: asString(frontmatter.category, DEFAULT_CATEGORY),
    recent: frontmatter.recent === true,
    content,
  }
}

const toMetadata = ({ content, ...metadata }: Post): PostMetadata => metadata

const sortByDateDesc = <T extends { date: string }>(posts: T[]) =>
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

function readPostFile(fileName: string): Post {
  const slug = getSlugFromFileName(fileName)
  const fullPath = path.join(postsDirectory, fileName)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return normalizePost(slug, data, content)
}

export function getAllPosts(): PostMetadata[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const posts = fs.readdirSync(postsDirectory)
    .filter(isPostFile)
    .map(readPostFile)
    .map(toMetadata)

  return sortByDateDesc(posts)
}

export function getRecentPosts(limit?: number): PostMetadata[] {
  const posts = getAllPosts().filter(post => post.recent)
  return typeof limit === 'number' ? posts.slice(0, limit) : posts
}

export function getMorePosts(): PostMetadata[] {
  return getAllPosts().filter(post => !post.recent)
}

export function getPostBySlug(slug: string): Post | null {
  const postPath = getPostPath(slug)
  if (!postPath) return null

  try {
    const fileContents = fs.readFileSync(postPath, 'utf8')
    const { data, content } = matter(fileContents)

    return normalizePost(slug, data, content)
  } catch {
    return null
  }
}

export function getPostPath(slug: string): string | null {
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`)
  const mdPath = path.join(postsDirectory, `${slug}.md`)

  if (fs.existsSync(mdxPath)) return mdxPath
  if (fs.existsSync(mdPath)) return mdPath

  return null
}
