'use server'

import { redirect } from 'next/navigation'
import { requireAdminAction } from '@/server/_shared/auth/admin-context'
import {
  replyAdminComment,
  sendCommentSmtpTest,
  updateAdminCommentStatus,
  updateAdminCommentStatuses,
  updateCommentAvatarSettings,
  updateCommentEmojiPacks,
  updateCommentSmtpSettings,
} from '@/server/comments/adapters/actions'
import {
  deleteAlbumPhoto,
  saveAlbumCategory,
  saveAlbumPhoto,
} from '@/server/album/adapters/actions'
import {
  deleteStackItem,
  saveStackCategory,
  saveStackItem,
} from '@/server/stack/adapters/actions'
import {
  approveFriendApplication,
  deleteFriendLink,
  refreshFriendFeedSnapshots,
  saveFriendApplicationSettings,
  saveFriendGroup,
  saveFriendLink,
  updateFriendApplicationStatus,
} from '@/server/friends/adapters/actions'
import { saveHomeSection } from '@/server/home/adapters/actions'
import {
  deleteWatchedItem,
  saveWatchedItem,
} from '@/server/watched/adapters/actions'
import { saveAdminPost } from '@/server/posts/adapters/actions'
import { deleteAdminMedia, uploadAdminMedia } from '@/server/media/adapters/actions'

async function requireAdmin() {
  return requireAdminAction()
}

export async function savePost(formData: FormData) {
  const admin = await requireAdmin()
  return saveAdminPost(admin, formData)
}

export async function updateCommentStatus(formData: FormData) {
  const admin = await requireAdmin()
  return updateAdminCommentStatus(admin, formData)
}

export async function updateCommentStatuses(formData: FormData) {
  const admin = await requireAdmin()
  return updateAdminCommentStatuses(admin, formData)
}

export async function replyComment(formData: FormData) {
  const admin = await requireAdmin()
  return replyAdminComment(admin, formData)
}

export async function saveCommentEmojiPacks(formData: FormData) {
  const admin = await requireAdmin()
  return updateCommentEmojiPacks(admin, formData)
}

export async function saveCommentAvatarSettings(formData: FormData) {
  const admin = await requireAdmin()
  return updateCommentAvatarSettings(admin, formData)
}

export async function saveCommentSmtpSettings(formData: FormData) {
  const admin = await requireAdmin()
  return updateCommentSmtpSettings(admin, formData)
}

export async function sendCommentSmtpTestAction(formData: FormData) {
  const admin = await requireAdmin()
  return sendCommentSmtpTest(admin, formData)
}

export async function saveWatched(formData: FormData) {
  const admin = await requireAdmin()
  return saveWatchedItem(admin, formData)
}

export async function deleteWatched(formData: FormData) {
  const admin = await requireAdmin()
  return deleteWatchedItem(admin, formData)
}

export async function saveAlbumCategoryAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveAlbumCategory(admin, formData)
}

export async function saveAlbumPhotoAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveAlbumPhoto(admin, formData)
}

export async function deleteAlbumPhotoAction(formData: FormData) {
  const admin = await requireAdmin()
  return deleteAlbumPhoto(admin, formData)
}

export async function saveStackCategoryAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveStackCategory(admin, formData)
}

export async function saveStackItemAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveStackItem(admin, formData)
}

export async function deleteStackItemAction(formData: FormData) {
  const admin = await requireAdmin()
  return deleteStackItem(admin, formData)
}

export async function saveFriendGroupAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveFriendGroup(admin, formData)
}

export async function saveFriendLinkAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveFriendLink(admin, formData)
}

export async function deleteFriendLinkAction(formData: FormData) {
  const admin = await requireAdmin()
  return deleteFriendLink(admin, formData)
}

export async function refreshFriendFeeds() {
  const admin = await requireAdmin()
  return refreshFriendFeedSnapshots(admin)
}

export async function saveFriendApplicationSettingsAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveFriendApplicationSettings(admin, formData)
}

export async function updateFriendApplicationStatusAction(formData: FormData) {
  const admin = await requireAdmin()
  return updateFriendApplicationStatus(admin, formData)
}

export async function approveFriendApplicationAction(formData: FormData) {
  const admin = await requireAdmin()
  return approveFriendApplication(admin, formData)
}

export async function saveHomeSectionAction(formData: FormData) {
  const admin = await requireAdmin()
  return saveHomeSection(admin, formData)
}

export async function uploadMedia(formData: FormData) {
  const admin = await requireAdmin()
  return uploadAdminMedia(admin, formData)
}

export async function deleteMedia(formData: FormData) {
  const admin = await requireAdmin()
  return deleteAdminMedia(admin, formData)
}
