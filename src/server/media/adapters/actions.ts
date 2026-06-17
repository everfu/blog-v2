'use server'

import {
  deleteAdminMedia as deleteAdminMediaCommand,
  uploadAdminMedia as uploadAdminMediaCommand,
} from '../application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function uploadAdminMedia(admin: CurrentAdmin, formData: FormData) {
  return uploadAdminMediaCommand(admin, formData)
}

export async function deleteAdminMedia(admin: CurrentAdmin, formData: FormData) {
  return deleteAdminMediaCommand(admin, formData)
}
