'use server'

import {
  replyAdminComment as replyAdminCommentCommand,
  sendCommentSmtpTest as sendCommentSmtpTestCommand,
  updateAdminCommentStatus as updateAdminCommentStatusCommand,
  updateAdminCommentStatuses as updateAdminCommentStatusesCommand,
  updateCommentAvatarSettings as updateCommentAvatarSettingsCommand,
  updateCommentEmojiPacks as updateCommentEmojiPacksCommand,
  updateCommentSmtpSettings as updateCommentSmtpSettingsCommand,
} from '../application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function updateAdminCommentStatus(admin: CurrentAdmin, formData: FormData) {
  return updateAdminCommentStatusCommand(admin, formData)
}

export async function updateAdminCommentStatuses(admin: CurrentAdmin, formData: FormData) {
  return updateAdminCommentStatusesCommand(admin, formData)
}

export async function replyAdminComment(admin: CurrentAdmin, formData: FormData) {
  return replyAdminCommentCommand(admin, formData)
}

export async function updateCommentEmojiPacks(admin: CurrentAdmin, formData: FormData) {
  return updateCommentEmojiPacksCommand(admin, formData)
}

export async function updateCommentAvatarSettings(admin: CurrentAdmin, formData: FormData) {
  return updateCommentAvatarSettingsCommand(admin, formData)
}

export async function updateCommentSmtpSettings(admin: CurrentAdmin, formData: FormData) {
  return updateCommentSmtpSettingsCommand(admin, formData)
}

export async function sendCommentSmtpTest(admin: CurrentAdmin, formData: FormData) {
  return sendCommentSmtpTestCommand(admin, formData)
}
