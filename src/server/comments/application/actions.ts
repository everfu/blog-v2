'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import crypto from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { CommentStatus } from '@/types/supabase'
import { avatarSettingsToJsonValue, emojiPackSourcesToJsonValue, parseEmojiPackSourcesInput, smtpSettingsToJsonValue } from './settings'
import { mapAdminComment } from '../data/mapper'
import { notifyUserForReply, sendTestCommentEmail } from '../integrations/email'
import type { AdminCommentRow, CommentSmtpSettings } from '../contracts/types'
import { logAdminEvent } from '@/server/_shared/audit/log-admin-event'

const commentStatuses = ['pending', 'approved', 'spam', 'deleted'] as const
const commentSettingsPath = '/admin/comment-settings'

function hash(value: string) {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex')
}

function getRedirectPath(formData: FormData) {
  const raw = String(formData.get('redirectTo') || '/admin/comments')
  return raw.startsWith('/admin/comments') ? raw : '/admin/comments'
}

function revalidateAdminCommentPages() {
  revalidatePath('/admin/comments')
  commentStatuses.forEach(status => revalidatePath(`/admin/comments/${status}`))
}

async function getAdminCommentById(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('comments')
    .select('id,page_path,post_id,parent_id,author_name,author_email,email_hash,website,body,status,auth_mode,location_label,ua_browser,ua_browser_version,ua_os,ua_device,ua_request_id,like_count,viewer_token_hash,user_agent,ip_hash,notified_owner_at,notified_reply_at,created_at')
    .eq('id', id)
    .maybeSingle()

  return data ? mapAdminComment(data as unknown as AdminCommentRow) : null
}

async function getCommentModerationTarget(id: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('comments')
    .select('id,status,page_path')
    .eq('id', id)
    .maybeSingle()

  return data as { id: string, status: CommentStatus, page_path: string } | null
}

async function notifyReplyIfNeeded(commentId: string) {
  const supabase = createAdminClient()
  const reply = await getAdminCommentById(commentId)
  if (!reply || reply.status !== 'approved' || !reply.parentId || reply.notifiedReplyAt) return

  const parent = await getAdminCommentById(reply.parentId)
  if (!parent?.authorEmail) return

  try {
    const sent = await notifyUserForReply(parent, reply)
    if (sent) {
      await supabase
        .from('comments')
        .update({ notified_reply_at: new Date().toISOString() })
        .eq('id', commentId)
    }
  } catch (error) {
    console.error('Failed to send comment reply notification', error)
  }
}

export async function updateAdminCommentStatus(admin: CurrentAdmin, formData: FormData) {
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '') as CommentStatus
  const redirectTo = getRedirectPath(formData)

  if (!id || !commentStatuses.includes(status)) {
    redirect('/admin/comments?error=invalid-comment')
  }

  const supabase = createAdminClient()
  const comment = await getCommentModerationTarget(id)
  if (!comment) {
    redirect('/admin/comments?error=invalid-comment')
  }

  const shouldDeletePermanently = status === 'deleted' && comment.status === 'deleted'
  const { error } = shouldDeletePermanently
    ? await supabase.from('comments').delete().eq('id', id)
    : await supabase.from('comments').update({ status }).eq('id', id)

  if (error) {
    redirect('/admin/comments?error=save')
  }

  await logAdminEvent(admin, {
    action: shouldDeletePermanently ? 'permanent_delete' : status,
    entityType: 'comment',
    entityId: id,
  })
  if (status === 'approved') await notifyReplyIfNeeded(id)

  revalidateAdminCommentPages()
  revalidatePath(comment.page_path)
  redirect(redirectTo)
}

export async function updateAdminCommentStatuses(admin: CurrentAdmin, formData: FormData) {
  const ids = formData.getAll('ids').map(value => String(value)).filter(Boolean)
  const status = String(formData.get('status') || '') as CommentStatus
  const redirectTo = getRedirectPath(formData)

  if (ids.length === 0 || !commentStatuses.includes(status)) {
    redirect('/admin/comments?error=invalid-comment')
  }

  const supabase = createAdminClient()
  if (status === 'deleted') {
    const { data: targets, error: targetError } = await supabase
      .from('comments')
      .select('id,status,page_path')
      .in('id', ids)

    if (targetError || !targets) {
      redirect('/admin/comments?error=save')
    }

    const deletedIds = targets
      .filter(comment => comment.status === 'deleted')
      .map(comment => comment.id)
    const softDeleteIds = targets
      .filter(comment => comment.status !== 'deleted')
      .map(comment => comment.id)

    if (deletedIds.length > 0) {
      const { error } = await supabase
        .from('comments')
        .delete()
        .in('id', deletedIds)

      if (error) redirect('/admin/comments?error=save')
    }

    if (softDeleteIds.length > 0) {
      const { error } = await supabase
        .from('comments')
        .update({ status })
        .in('id', softDeleteIds)

      if (error) redirect('/admin/comments?error=save')
    }

    await logAdminEvent(admin, {
      action: 'bulk_moderate',
      entityType: 'comment',
      entityId: ids[0],
      metadata: {
        ids,
        count: ids.length,
        status,
        permanentlyDeletedIds: deletedIds,
        softDeletedIds: softDeleteIds,
      },
    })

    revalidateAdminCommentPages()
    Array.from(new Set(targets.map(comment => comment.page_path).filter(Boolean)))
      .forEach(pagePath => revalidatePath(pagePath))
    redirect(redirectTo)
  }

  const { error } = await supabase
    .from('comments')
    .update({ status })
    .in('id', ids)

  if (error) {
    redirect('/admin/comments?error=save')
  }

  await logAdminEvent(admin, {
    action: 'bulk_moderate',
    entityType: 'comment',
    entityId: ids[0],
    metadata: { ids, count: ids.length, status },
  })
  if (status === 'approved') {
    await Promise.all(ids.map(id => notifyReplyIfNeeded(id)))
  }

  revalidateAdminCommentPages()
  redirect(redirectTo)
}

export async function replyAdminComment(admin: CurrentAdmin, formData: FormData) {
  const parentId = String(formData.get('parentId') || '')
  const pagePath = String(formData.get('pagePath') || '')
  const postId = String(formData.get('postId') || '') || null
  const body = String(formData.get('body') || '').trim()
  const redirectTo = getRedirectPath(formData)

  if (!parentId || !pagePath.startsWith('/') || body.length < 2 || body.length > 2000) {
    redirect('/admin/comments?error=invalid-comment')
  }

  const supabase = createAdminClient()
  const parent = await getAdminCommentById(parentId)
  if (!parent) {
    redirect('/admin/comments?error=invalid-comment')
  }

  const email = admin.email?.trim().toLowerCase() || null
  const { data: inserted, error } = await supabase
    .from('comments')
    .insert({
      page_path: pagePath,
      post_id: postId,
      parent_id: parentId,
      user_id: admin.id,
      author_name: admin.displayName || admin.githubUsername || '站长',
      author_email: email,
      email_hash: email ? hash(email) : null,
      website: null,
      body,
      status: 'approved',
      auth_mode: 'authenticated',
    })
    .select('id')
    .single()

  if (error || !inserted) {
    redirect('/admin/comments?error=save')
  }

  await logAdminEvent(admin, {
    action: 'reply',
    entityType: 'comment',
    entityId: inserted.id,
    metadata: { parentId },
  })
  await notifyReplyIfNeeded(inserted.id)

  revalidateAdminCommentPages()
  revalidatePath(pagePath)
  redirect(redirectTo)
}

export async function updateCommentEmojiPacks(admin: CurrentAdmin, formData: FormData) {
  const rawValue = String(formData.get('emojiPacks') || '').trim()
  const emojiPackSources = parseEmojiPackSourcesInput(rawValue)
  if (!emojiPackSources) {
    redirect(`${commentSettingsPath}?error=emoji-sources`)
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('comment_settings')
    .upsert({
      key: 'emoji_packs',
      value: emojiPackSourcesToJsonValue(emojiPackSources),
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    redirect(`${commentSettingsPath}?error=emoji-save`)
  }

  revalidatePath(commentSettingsPath)
  revalidatePath('/', 'layout')
  redirect(`${commentSettingsPath}?saved=emoji-packs`)
}

export async function updateCommentAvatarSettings(admin: CurrentAdmin, formData: FormData) {
  const enabled = formData.get('enabled') === 'on'
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('comment_settings')
    .upsert({
      key: 'avatar_provider',
      value: avatarSettingsToJsonValue({ enabled, provider: 'weavatar' }),
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    redirect(`${commentSettingsPath}?error=avatar-save`)
  }

  revalidatePath(commentSettingsPath)
  revalidatePath('/', 'layout')
  redirect(`${commentSettingsPath}?saved=avatar-provider`)
}

function readSmtpSettings(formData: FormData): CommentSmtpSettings {
  return {
    enabled: formData.get('enabled') === 'on',
    host: String(formData.get('host') || '').trim(),
    port: Number(formData.get('port') || 465),
    secure: formData.get('secure') === 'on',
    username: String(formData.get('username') || '').trim(),
    password: String(formData.get('password') || ''),
    fromName: String(formData.get('fromName') || '').trim(),
    fromEmail: String(formData.get('fromEmail') || '').trim(),
    ownerEmail: String(formData.get('ownerEmail') || '').trim(),
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function updateCommentSmtpSettings(admin: CurrentAdmin, formData: FormData) {
  const settings = readSmtpSettings(formData)
  if (settings.enabled && (!settings.host || !settings.fromEmail || !settings.ownerEmail || !isEmail(settings.fromEmail) || !isEmail(settings.ownerEmail))) {
    redirect(`${commentSettingsPath}?error=smtp-save`)
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('comment_settings')
    .upsert({
      key: 'smtp',
      value: smtpSettingsToJsonValue(settings),
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    redirect(`${commentSettingsPath}?error=smtp-save`)
  }

  revalidatePath(commentSettingsPath)
  redirect(`${commentSettingsPath}?saved=smtp`)
}

export async function sendCommentSmtpTest(_admin: CurrentAdmin, formData: FormData) {
  const to = String(formData.get('to') || '').trim()
  if (!to) redirect(`${commentSettingsPath}?error=smtp-test-email`)

  try {
    await sendTestCommentEmail(to)
  } catch (error) {
    console.error('Failed to send comment SMTP test email', error)
    redirect(`${commentSettingsPath}?error=smtp-test`)
  }

  redirect(`${commentSettingsPath}?saved=smtp-test`)
}
