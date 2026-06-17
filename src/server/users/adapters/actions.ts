'use server'

import { updateAdminUserRole as updateAdminUserRoleCommand } from '../application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function updateAdminUserRole(admin: CurrentAdmin, formData: FormData) {
  return updateAdminUserRoleCommand(admin, formData)
}
