'use server'

import {
  deleteStackItem as deleteStackItemCommand,
  saveStackCategory as saveStackCategoryCommand,
  saveStackItem as saveStackItemCommand,
} from '@/server/content/application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function saveStackCategory(admin: CurrentAdmin, formData: FormData) {
  return saveStackCategoryCommand(admin, formData)
}

export async function saveStackItem(admin: CurrentAdmin, formData: FormData) {
  return saveStackItemCommand(admin, formData)
}

export async function deleteStackItem(admin: CurrentAdmin, formData: FormData) {
  return deleteStackItemCommand(admin, formData)
}
