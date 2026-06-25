'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { ContentStatus, FriendApplicationStatus } from '@/types/supabase'
import { logAdminEventWithClient } from '@/server/_shared/audit/log-admin-event-with-client'
import { revalidateContent } from '@/server/_shared/cache/revalidate'
import { optionalTextSchema, optionalUrlSchema, parseCsv, resolveImageUrl, statusSchema, textOrNull } from '@/server/_shared/actions/form'
import { parseFeedXml } from '@/server/feeds/application/parse-feed'
import { getFriendFavicon } from '@/server/feeds/application/utils'

const friendGroupSchema = z.object({
  id: optionalTextSchema,
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const friendLinkSchema = z.object({
  id: optionalTextSchema,
  groupId: optionalTextSchema,
  author: z.string().trim().min(1).max(100),
  sitenick: optionalTextSchema,
  description: z.string().trim().max(500).optional(),
  linkUrl: z.string().trim().url(),
  feedUrl: optionalUrlSchema,
  feedMuted: z.enum(['on']).optional(),
  avatarUrl: optionalUrlSchema,
  archs: optionalTextSchema,
  joinedAt: z.string().trim().min(1),
  status: statusSchema,
  sortOrder: z.coerce.number().int().default(0),
})

const friendApplicationSettingsSchema = z.object({
  enabled: z.enum(['on']).optional(),
})

const friendApplicationStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['rejected']),
})

const friendApplicationApprovalSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
})

export async function saveFriendGroup(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendGroupSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-group')

  const supabase = await createClient()
  const payload = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description || '',
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('friend_groups').update(payload).eq('id', id).select('id').single()
    : await supabase.from('friend_groups').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/friends?error=save-group')
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'friend_group', result.data.id, { name: parsed.data.name })
  revalidateContent(['links', 'friends'], ['/links', '/friends', '/admin/friends'])
  redirect('/admin/friends?saved=group')
}

export async function saveFriendLink(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendLinkSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-link')

  const supabase = await createClient()
  const avatarUrl = await resolveImageUrl(formData, 'avatarUrl', 'avatarFile', 'friends')
  const payload = {
    group_id: textOrNull(parsed.data.groupId),
    author: parsed.data.author,
    sitenick: textOrNull(parsed.data.sitenick),
    description: parsed.data.description || '',
    link_url: parsed.data.linkUrl,
    feed_url: textOrNull(parsed.data.feedUrl),
    feed_muted: parsed.data.feedMuted === 'on',
    icon_url: getFriendFavicon(parsed.data.linkUrl),
    avatar_url: avatarUrl,
    archs: parseCsv(parsed.data.archs),
    joined_at: parsed.data.joinedAt,
    status: parsed.data.status as ContentStatus,
    sort_order: parsed.data.sortOrder,
  }
  const id = textOrNull(parsed.data.id)
  const result = id
    ? await supabase.from('friend_links').update(payload).eq('id', id).select('id').single()
    : await supabase.from('friend_links').insert(payload).select('id').single()

  if (result.error || !result.data) redirect('/admin/friends?error=save-link')
  await logAdminEventWithClient(supabase, admin, id ? 'update' : 'create', 'friend_link', result.data.id, { author: parsed.data.author })
  revalidateContent(['links', 'friends'], ['/links', '/friends', '/admin/friends'])
  redirect('/admin/friends?saved=link')
}

export async function deleteFriendLink(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const { error } = await supabase.from('friend_links').delete().eq('id', id)
  if (error) redirect('/admin/friends?error=delete-link')
  await logAdminEventWithClient(supabase, admin, 'delete', 'friend_link', id)
  revalidateContent(['links', 'friends'], ['/links', '/friends', '/admin/friends'])
  redirect('/admin/friends?deleted=link')
}

export async function saveFriendApplicationSettings(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendApplicationSettingsSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-application-settings')

  const supabase = await createClient()
  const enabled = parsed.data.enabled === 'on'
  const { error } = await supabase
    .from('friend_application_settings')
    .upsert({
      key: 'application_form',
      value: { enabled },
      updated_by: admin.id,
    })

  if (error) redirect('/admin/friends?error=application-settings')
  await logAdminEventWithClient(supabase, admin, 'update_friend_application_settings', 'friend_application_settings', 'application_form', { enabled })
  revalidateContent(['friend-applications', 'links'], ['/links', '/admin/friends'])
  redirect('/admin/friends?saved=applications')
}

export async function updateFriendApplicationStatus(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendApplicationStatusSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-application')

  const supabase = await createClient()
  const status = parsed.data.status as FriendApplicationStatus
  const { error } = await supabase
    .from('friend_link_applications')
    .update({ status })
    .eq('id', parsed.data.id)

  if (error) redirect('/admin/friends?error=application-status')
  await logAdminEventWithClient(supabase, admin, 'reject_friend_application', 'friend_link_application', parsed.data.id)
  revalidateContent(['friend-applications'], ['/admin/friends'])
  redirect('/admin/friends?saved=application-status')
}

export async function approveFriendApplication(admin: CurrentAdmin, formData: FormData) {
  const parsed = friendApplicationApprovalSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/friends?error=invalid-application')

  const supabase = await createClient()
  const [{ data: application, error: applicationError }, { data: group, error: groupError }] = await Promise.all([
    supabase
      .from('friend_link_applications')
      .select('id, author_name, site_name, description, site_url, avatar_url, feed_url, status')
      .eq('id', parsed.data.id)
      .maybeSingle(),
    supabase
      .from('friend_groups')
      .select('id')
      .eq('id', parsed.data.groupId)
      .maybeSingle(),
  ])

  if (applicationError || !application) redirect('/admin/friends?error=application-not-found')
  if (application.status !== 'pending') redirect('/admin/friends?error=application-already-handled')
  if (groupError || !group) redirect('/admin/friends?error=invalid-application-group')

  const { data: handledApplication, error: statusError } = await supabase
    .from('friend_link_applications')
    .update({ status: 'handled' as FriendApplicationStatus })
    .eq('id', parsed.data.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (statusError) redirect('/admin/friends?error=application-status')
  if (!handledApplication) redirect('/admin/friends?error=application-already-handled')

  const today = new Date().toISOString().slice(0, 10)
  const { data: link, error: linkError } = await supabase
    .from('friend_links')
    .insert({
      group_id: parsed.data.groupId,
      author: application.author_name,
      sitenick: textOrNull(application.site_name),
      description: application.description,
      link_url: application.site_url,
      feed_url: textOrNull(application.feed_url || undefined),
      feed_muted: false,
      icon_url: getFriendFavicon(application.site_url),
      avatar_url: textOrNull(application.avatar_url || undefined),
      archs: [],
      joined_at: today,
      status: 'published' as ContentStatus,
      sort_order: 0,
    })
    .select('id')
    .single()

  if (linkError || !link) {
    await supabase
      .from('friend_link_applications')
      .update({ status: 'pending' as FriendApplicationStatus })
      .eq('id', parsed.data.id)
      .eq('status', 'handled')
    redirect('/admin/friends?error=approve-application')
  }

  await logAdminEventWithClient(supabase, admin, 'handle_friend_application', 'friend_link_application', parsed.data.id, { friendLinkId: link.id })
  await logAdminEventWithClient(supabase, admin, 'create', 'friend_link', link.id, { author: application.author_name, applicationId: parsed.data.id })
  revalidateContent(['links', 'friends', 'friend-applications'], ['/links', '/friends', '/api/friends', '/admin/friends'])
  redirect('/admin/friends?saved=application-approved')
}

export async function refreshFriendFeedSnapshots(admin: CurrentAdmin) {
  const supabase = await createClient()
  const service = createAdminClient()
  const [{ data: links, error }, { data: mutedLinks, error: mutedError }] = await Promise.all([
    service
      .from('friend_links')
      .select('id, author, sitenick, link_url, feed_url, avatar_url, archs')
      .eq('status', 'published')
      .eq('feed_muted', false)
      .not('feed_url', 'is', null),
    service
      .from('friend_links')
      .select('id')
      .eq('feed_muted', true),
  ])

  if (error || mutedError || !links) redirect('/admin/friends?error=feed-load')

  const mutedIds = (mutedLinks || []).map(link => link.id)
  if (mutedIds.length > 0) {
    const { error: clearError } = await service
      .from('friend_feed_snapshots')
      .delete()
      .in('friend_link_id', mutedIds)

    if (clearError) redirect('/admin/friends?error=feed-save')
  }

  const rows = []
  for (const link of links) {
    try {
      const response = await fetch(link.feed_url || '', {
        headers: {
          Accept: 'application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
          'User-Agent': `cube-blog-friends/1.0 (+${link.link_url})`,
        },
        cache: 'no-store',
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const parsed = parseFeedXml(await response.text(), 10)
      rows.push(...parsed.filter(item => item.pubDate).map(item => ({
        friend_link_id: link.id,
        author: link.author,
        sitenick: link.sitenick,
        avatar_url: link.avatar_url,
        site_link: link.link_url,
        archs: link.archs,
        title: item.title,
        link_url: item.link,
        summary: item.summary,
        cover_url: item.cover,
        pub_date: item.pubDate,
        source_status: { ok: true },
      })))
      await service.from('friend_links').update({ last_checked_at: new Date().toISOString(), last_error: null }).eq('id', link.id)
    } catch (feedError) {
      await service.from('friend_links').update({
        last_checked_at: new Date().toISOString(),
        last_error: feedError instanceof Error ? feedError.message : String(feedError),
      }).eq('id', link.id)
    }
  }

  if (rows.length > 0) {
    await service.from('friend_feed_snapshots').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    const { error: insertError } = await service.from('friend_feed_snapshots').insert(rows)
    if (insertError) redirect('/admin/friends?error=feed-save')
  }

  await logAdminEventWithClient(supabase, admin, 'refresh_feed_snapshots', 'friend_feed_snapshots', null, { inserted: rows.length })
  revalidateContent(['friends'], ['/friends', '/api/friends', '/admin/friends'])
  redirect('/admin/friends?refreshed=1')
}
