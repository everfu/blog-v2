'use server'

import {
  approveFriendApplication as approveFriendApplicationCommand,
  deleteFriendLink as deleteFriendLinkCommand,
  refreshFriendFeedSnapshots as refreshFriendFeedSnapshotsCommand,
  saveFriendApplicationSettings as saveFriendApplicationSettingsCommand,
  saveFriendGroup as saveFriendGroupCommand,
  saveFriendLink as saveFriendLinkCommand,
  updateFriendApplicationStatus as updateFriendApplicationStatusCommand,
} from '@/server/friends/application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

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

export async function approveFriendApplication(admin: CurrentAdmin, formData: FormData) {
  return approveFriendApplicationCommand(admin, formData)
}

export async function refreshFriendFeedSnapshots(admin: CurrentAdmin) {
  return refreshFriendFeedSnapshotsCommand(admin)
}
