import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config'
import type { Json } from '@/types/supabase'
import { normalizeEmojiIconSource } from '../contracts/emoji'
import type { CommentSmtpSettings } from '../contracts/types'

export const emojiItemSchema = z.object({
  text: z.string().trim().max(60),
  icon: z.string().trim().min(1).max(600),
}).transform(item => ({
  ...item,
  icon: normalizeEmojiIconSource(item.icon),
}))

export const emojiCategorySchema = z.object({
  type: z.enum(['image', 'text', 'emoji', 'emoticon']),
  container: z.array(emojiItemSchema).min(1).max(120),
})

export const emojiPackSchema = z.record(
  z.string().trim().min(1).max(40),
  emojiCategorySchema
).refine(pack => Object.keys(pack).length > 0, {
  message: '每个表情包对象至少包含一个分类。',
})

export const emojiPacksSchema = z.array(emojiPackSchema).max(12)

export const defaultEmojiPackSources = ['https://owo.imaegoo.com/owo.json'] as const

export const emojiPackSourcesSchema = z.array(
  z.string().trim().url().refine(value => /^https?:\/\//i.test(value), {
    message: '表情包地址必须使用 http 或 https。',
  })
).min(1).max(12)

export const commentAvatarSettingsSchema = z.object({
  enabled: z.boolean(),
  provider: z.literal('weavatar'),
})

export const commentSmtpSettingsSchema = z.object({
  enabled: z.boolean(),
  host: z.string().trim().max(200),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().trim().max(200),
  password: z.string().max(500),
  fromName: z.string().trim().max(80),
  fromEmail: z.string().trim().email().or(z.literal('')),
  ownerEmail: z.string().trim().email().or(z.literal('')),
})

export type EmojiItem = z.infer<typeof emojiItemSchema>
export type EmojiPack = z.infer<typeof emojiPackSchema>
export type CommentAvatarSettings = z.infer<typeof commentAvatarSettingsSchema>

export const defaultEmojiPacks: EmojiPack[] = [
  {
    默认: {
      type: 'emoji',
      container: [
        { text: '', icon: '🙂' },
        { text: '', icon: '✨' },
        { text: '', icon: '❤️' },
      ],
    },
  },
]

export const defaultCommentAvatarSettings: CommentAvatarSettings = {
  enabled: true,
  provider: 'weavatar',
}

export const defaultCommentSmtpSettings: CommentSmtpSettings = {
  enabled: false,
  host: '',
  port: 465,
  secure: true,
  username: '',
  password: '',
  fromName: '',
  fromEmail: '',
  ownerEmail: '',
}

export function parseEmojiPacksInput(value: unknown): EmojiPack[] | null {
  const parsed = emojiPacksSchema.safeParse(value)
  if (parsed.success) return parsed.data

  const singlePack = emojiPackSchema.safeParse(value)
  return singlePack.success ? [singlePack.data] : null
}

export function parseEmojiPacks(value: unknown): EmojiPack[] {
  return parseEmojiPacksInput(value) || defaultEmojiPacks
}

export function parseEmojiPackSourcesInput(value: string): string[] | null {
  const sources = Array.from(new Set(
    value
      .split(/\r?\n/)
      .map(source => source.trim())
      .filter(Boolean)
  ))

  if (sources.length === 0) return [...defaultEmojiPackSources]

  const parsed = emojiPackSourcesSchema.safeParse(sources)
  return parsed.success ? parsed.data : null
}

export function parseEmojiPackSources(value: unknown): string[] {
  const stringArray = z.array(z.string()).safeParse(value)
  if (stringArray.success) {
    const sources = Array.from(new Set(stringArray.data.map(source => source.trim()).filter(Boolean)))
    if (sources.length === 0) return [...defaultEmojiPackSources]

    const parsed = emojiPackSourcesSchema.safeParse(sources)
    if (parsed.success) return parsed.data
  }

  if (typeof value === 'string') {
    return parseEmojiPackSourcesInput(value) || [...defaultEmojiPackSources]
  }

  return [...defaultEmojiPackSources]
}

export function formatEmojiPackSources(sources: string[]) {
  return sources.join('\n')
}

async function fetchEmojiPackSource(source: string): Promise<EmojiPack[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch(source, {
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) return []

    const payload = await response.json().catch(() => null)
    return parseEmojiPacksInput(payload) || []
  } catch (error) {
    console.error('Failed to load emoji pack source', source, error)
    return []
  } finally {
    clearTimeout(timeout)
  }
}

export function parseCommentAvatarSettings(value: unknown): CommentAvatarSettings {
  const parsed = commentAvatarSettingsSchema.safeParse(value)
  return parsed.success ? parsed.data : defaultCommentAvatarSettings
}

export function parseCommentSmtpSettings(value: unknown): CommentSmtpSettings {
  const parsed = commentSmtpSettingsSchema.safeParse(value)
  return parsed.success ? parsed.data : defaultCommentSmtpSettings
}

export async function getEmojiPacks(): Promise<EmojiPack[]> {
  const sources = await getEmojiPackSources()
  const packs = (await Promise.all(sources.map(fetchEmojiPackSource))).flat()
  return packs.length > 0 ? packs : defaultEmojiPacks
}

export async function getEmojiPackSources(): Promise<string[]> {
  if (!isSupabaseConfigured) return [...defaultEmojiPackSources]

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comment_settings')
    .select('value')
    .eq('key', 'emoji_packs')
    .maybeSingle()

  if (error || !data) return [...defaultEmojiPackSources]

  return parseEmojiPackSources(data.value)
}

export async function getCommentAvatarSettings(): Promise<CommentAvatarSettings> {
  if (!isSupabaseConfigured) return defaultCommentAvatarSettings

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comment_settings')
    .select('value')
    .eq('key', 'avatar_provider')
    .maybeSingle()

  if (error || !data) return defaultCommentAvatarSettings

  return parseCommentAvatarSettings(data.value)
}

export async function getCommentSmtpSettings(): Promise<CommentSmtpSettings> {
  if (!isSupabaseAdminConfigured) return defaultCommentSmtpSettings

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('comment_settings')
    .select('value')
    .eq('key', 'smtp')
    .maybeSingle()

  if (error || !data) return defaultCommentSmtpSettings

  return parseCommentSmtpSettings(data.value)
}

export function emojiPackSourcesToJsonValue(value: string[]): Json {
  return value as Json
}

export function avatarSettingsToJsonValue(value: CommentAvatarSettings): Json {
  return value as Json
}

export function smtpSettingsToJsonValue(value: CommentSmtpSettings): Json {
  return value as unknown as Json
}
