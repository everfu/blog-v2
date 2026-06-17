'use server'

import { saveAdminPost as saveAdminPostCommand } from '../application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function saveAdminPost(admin: CurrentAdmin, formData: FormData) {
  return saveAdminPostCommand(admin, formData)
}
