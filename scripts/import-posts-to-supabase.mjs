import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const root = process.cwd()
const postsDirectory = path.join(root, 'content/posts')
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const isPostFile = fileName => /\.(md|mdx)$/.test(fileName) && !fileName.toLowerCase().startsWith('readme')
const isYearDirectory = directoryName => /^\d{4}$/.test(directoryName)
const slugFromFileName = fileName => fileName.replace(/\.(md|mdx)$/, '')

function asString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function normalizeTags(value) {
  return Array.isArray(value)
    ? value.filter(tag => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean)
    : []
}

function normalizeDate(value, year) {
  const fallback = `${year}-01-01T00:00:00.000Z`
  const date = value instanceof Date ? value : new Date(value || fallback)
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString()
}

function createExcerpt(frontmatterExcerpt, content) {
  return asString(frontmatterExcerpt, `${content.trim().slice(0, 150)}...`)
}

function readLocalPosts() {
  if (!fs.existsSync(postsDirectory)) return []

  return fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && isYearDirectory(entry.name))
    .flatMap(({ name: year }) =>
      fs.readdirSync(path.join(postsDirectory, year))
        .filter(isPostFile)
        .map((fileName) => {
          const fullPath = path.join(postsDirectory, year, fileName)
          const fileContents = fs.readFileSync(fullPath, 'utf8')
          const { data, content } = matter(fileContents)
          const publishedAt = normalizeDate(data.date, year)

          return {
            slug: slugFromFileName(fileName),
            year: Number(year),
            title: asString(data.title, slugFromFileName(fileName)),
            excerpt: createExcerpt(data.excerpt, content),
            content,
            tags: normalizeTags(data.tags),
            cover: asString(data.cover) || null,
            category: asString(data.category, 'DAILY'),
            recent: data.recent === true,
            status: 'published',
            published_at: publishedAt,
          }
        })
    )
}

const posts = readLocalPosts()

if (!posts.length) {
  console.log('No local posts found.')
  process.exit(0)
}

const { error } = await supabase
  .from('posts')
  .upsert(posts, { onConflict: 'slug' })

if (error) {
  console.error(error)
  process.exit(1)
}

const { count, error: countError } = await supabase
  .from('posts')
  .select('*', { count: 'exact', head: true })

if (countError) {
  console.warn('Imported posts, but could not verify remote count:', countError.message)
} else {
  console.log(`Imported ${posts.length} local posts. Remote posts count: ${count}.`)
}
