'use server'

import type { CurrentAdmin } from '@/lib/auth/admin'
import {
  deleteAlbumPhoto as deleteAlbumPhotoCommand,
  deleteFriendLink as deleteFriendLinkCommand,
  deleteStackItem as deleteStackItemCommand,
  deleteWatchedItem as deleteWatchedItemCommand,
  refreshFriendFeedSnapshots as refreshFriendFeedSnapshotsCommand,
  saveAlbumCategory as saveAlbumCategoryCommand,
  saveAlbumPhoto as saveAlbumPhotoCommand,
  saveFriendApplicationSettings as saveFriendApplicationSettingsCommand,
  saveFriendGroup as saveFriendGroupCommand,
  saveFriendLink as saveFriendLinkCommand,
  saveHomeSection as saveHomeSectionCommand,
  saveStackCategory as saveStackCategoryCommand,
  saveStackItem as saveStackItemCommand,
  saveWatchedItem as saveWatchedItemCommand,
  updateFriendApplicationStatus as updateFriendApplicationStatusCommand,
} from '@/server/content/application/actions'

export async function saveWatchedItem(admin: CurrentAdmin, formData: FormData) {
  return saveWatchedItemCommand(admin, formData)
}

export async function deleteWatchedItem(admin: CurrentAdmin, formData: FormData) {
  return deleteWatchedItemCommand(admin, formData)
}

export async function saveAlbumCategory(admin: CurrentAdmin, formData: FormData) {
  return saveAlbumCategoryCommand(admin, formData)
}

export async function saveAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  return saveAlbumPhotoCommand(admin, formData)
}

export async function deleteAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  return deleteAlbumPhotoCommand(admin, formData)
}

export async function saveStackCategory(admin: CurrentAdmin, formData: FormData) {
  return saveStackCategoryCommand(admin, formData)
}

export async function saveStackItem(admin: CurrentAdmin, formData: FormData) {
  return saveStackItemCommand(admin, formData)
}

export async function deleteStackItem(admin: CurrentAdmin, formData: FormData) {
  return deleteStackItemCommand(admin, formData)
}

export async function saveFriendGroup(admin: CurrentAdmin, formData: FormData) {
  return saveFriendGroupCommand(admin, formData)
}

export async function saveFriendLink(admin: CurrentAdmin, formData: FormData) {
  return saveFriendLinkCommand(admin, formData)
}

export async function deleteFriendLink(admin: CurrentAdmin, formData: FormData) {
  return deleteFriendLinkCommand(admin, formData)
}

export async function saveFriendApplicationSettings(admin: CurrentAdmin, formData: FormData) {
  return saveFriendApplicationSettingsCommand(admin, formData)
}

export async function updateFriendApplicationStatus(admin: CurrentAdmin, formData: FormData) {
  return updateFriendApplicationStatusCommand(admin, formData)
}

export async function refreshFriendFeedSnapshots(admin: CurrentAdmin) {
  return refreshFriendFeedSnapshotsCommand(admin)
}

export async function saveHomeSection(admin: CurrentAdmin, formData: FormData) {
  return saveHomeSectionCommand(admin, formData)
}
