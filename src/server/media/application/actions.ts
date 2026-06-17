'use server'

import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CurrentAdmin } from '@/lib/auth/admin'
import { MEDIA_BUCKET, MEDIA_FOLDERS, type AdminMediaFolder } from './admin'
import { logAdminEvent } from '@/server/_shared/audit/log-admin-event'
import { safeFileExtension } from '@/server/_shared/storage/site-media'

const uploadSchema = z.object({
  folder: z.enum(MEDIA_FOLDERS.filter(folder => folder !== 'all') as [Exclude<AdminMediaFolder, 'all'>, ...Array<Exclude<AdminMediaFolder, 'all'>>]).default('uploads'),
})

async function audit(admin: CurrentAdmin, action: string, path: string, metadata = {}) {
  await logAdminEvent(admin, {
    action,
    entityType: 'media_asset',
    entityId: path,
    metadata,
  })
}

export async function uploadAdminMedia(admin: CurrentAdmin, formData: FormData) {
  const parsed = uploadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) redirect('/admin/media?error=invalid-folder')

  const files = formData.getAll('files').filter((file): file is File => file instanceof File && file.size > 0)
  if (files.length === 0) redirect(`/admin/media?folder=${parsed.data.folder}&error=no-file`)

  const storage = createAdminClient().storage.from(MEDIA_BUCKET)
  const uploaded: string[] = []

  for (const file of files) {
    const extension = safeFileExtension(file.name)
    const path = `${parsed.data.folder}/${randomUUID()}.${extension}`
    const { error } = await storage.upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    })

    if (error) redirect(`/admin/media?folder=${parsed.data.folder}&error=upload`)
    uploaded.push(path)
  }

  await audit(admin, 'upload', uploaded[0], { count: uploaded.length, paths: uploaded })
  revalidatePath('/admin/media')
  redirect(`/admin/media?folder=${parsed.data.folder}&uploaded=${uploaded.length}`)
}

export async function deleteAdminMedia(admin: CurrentAdmin, formData: FormData) {
  const path = String(formData.get('path') || '')
  const redirectFolder = String(formData.get('folder') || 'all')

  if (!path || path.includes('..')) redirect('/admin/media?error=invalid-path')

  const { error } = await createAdminClient().storage.from(MEDIA_BUCKET).remove([path])
  if (error) redirect(`/admin/media?folder=${redirectFolder}&error=delete`)

  await audit(admin, 'delete', path)
  revalidatePath('/admin/media')
  redirect(`/admin/media?folder=${redirectFolder}&deleted=1`)
}
