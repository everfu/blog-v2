'use server'

import {
  deleteWatchedItem as deleteWatchedItemCommand,
  saveWatchedItem as saveWatchedItemCommand,
} from '@/server/watched/application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function saveWatchedItem(admin: CurrentAdmin, formData: FormData) {
  return saveWatchedItemCommand(admin, formData)
}

export async function deleteWatchedItem(admin: CurrentAdmin, formData: FormData) {
  return deleteWatchedItemCommand(admin, formData)
}
