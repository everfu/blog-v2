import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { getClientIp } from '@/server/_shared/request/client'
import { hashRequestValue } from '@/server/_shared/request/hash'
import { notifyOwnerForFriendApplication } from '@/server/comments/integrations/email'
import { getFriendApplicationSettings } from '@/server/friends/adapters/page'

const friendApplicationSchema = z.object({
  authorName: z.string().trim().min(1).max(80),
  siteName: z.string().trim().min(1).max(120),
  description: z.string().trim().min(2).max(500),
  siteUrl: z.string().trim().min(1).max(240),
  avatarUrl: z.string().trim().max(240).optional().or(z.literal('')),
  feedUrl: z.string().trim().max(240).optional().or(z.literal('')),
  contact: z.string().trim().max(160).optional().or(z.literal('')),
  note: z.string().trim().max(800).optional().or(z.literal('')),
})

type JsonResult =
  | { body: Record<string, unknown>; status?: number }
  | { body: { message: string }; status: number }

function normalizeUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function readUrl(value: string | undefined, message: string) {
  const normalized = normalizeUrl(value)
  if (!normalized) return null

  try {
    return new URL(normalized).toString()
  } catch {
    throw new Error(message)
  }
}

export async function submitFriendApplication(request: NextRequest): Promise<JsonResult> {
  if (!isSupabaseAdminConfigured) {
    return { body: { message: '友链申请暂未配置。' }, status: 503 }
  }

  const settings = await getFriendApplicationSettings()
  if (!settings.enabled) {
    return { body: { message: '友链申请暂未开放。' }, status: 403 }
  }

  const body = await request.json().catch(() => null)
  const parsed = friendApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return { body: { message: '请完整填写站长、站点、简介和网址。' }, status: 400 }
  }

  let siteUrl: string
  let avatarUrl: string | null
  let feedUrl: string | null
  try {
    siteUrl = readUrl(parsed.data.siteUrl, '网站地址格式不正确。') as string
    avatarUrl = readUrl(parsed.data.avatarUrl, '头像地址格式不正确。')
    feedUrl = readUrl(parsed.data.feedUrl, 'Feed 地址格式不正确。')
  } catch (error) {
    return {
      body: { message: error instanceof Error ? error.message : '链接格式不正确。' },
      status: 400,
    }
  }

  const supabase = createAdminClient()
  const ipHash = hashRequestValue(getClientIp(request))
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('friend_link_applications')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', tenMinutesAgo)

  if ((count || 0) >= 3) {
    return { body: { message: '提交太频繁了，稍后再试。' }, status: 429 }
  }

  const payload = {
    author_name: parsed.data.authorName,
    site_name: parsed.data.siteName,
    description: parsed.data.description,
    site_url: siteUrl,
    avatar_url: avatarUrl,
    feed_url: feedUrl,
    contact: parsed.data.contact || '',
    note: parsed.data.note || '',
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent'),
  }
  const { data, error } = await supabase
    .from('friend_link_applications')
    .insert(payload)
    .select('id, author_name, site_name, description, site_url, avatar_url, feed_url, contact, note')
    .single()

  if (error || !data) {
    console.error('Friend application insert failed', error)
    return { body: { message: '友链申请提交失败。' }, status: 500 }
  }

  try {
    await notifyOwnerForFriendApplication({
      id: data.id,
      authorName: data.author_name,
      siteName: data.site_name,
      description: data.description,
      siteUrl: data.site_url,
      avatarUrl: data.avatar_url,
      feedUrl: data.feed_url,
      contact: data.contact,
      note: data.note,
    })
  } catch (notificationError) {
    console.error('Failed to send friend application notification', notificationError)
  }

  return { body: { message: '申请已提交，审核后会处理。' }, status: 201 }
}

