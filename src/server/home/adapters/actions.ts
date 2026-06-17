'use server'

import { saveHomeSection as saveHomeSectionCommand } from '@/server/content/application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function saveHomeSection(admin: CurrentAdmin, formData: FormData) {
  return saveHomeSectionCommand(admin, formData)
}
