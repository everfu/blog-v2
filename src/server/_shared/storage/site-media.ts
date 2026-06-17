import { randomUUID } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const SITE_MEDIA_BUCKET = 'site-media'

export function safeFileExtension(name: string) {
  return name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
}

export async function uploadSiteMediaFile(file: File, folder: string) {
  const extension = safeFileExtension(file.name)
  const path = `${folder}/${randomUUID()}.${extension}`
  const storage = createAdminClient().storage.from(SITE_MEDIA_BUCKET)
  const { error } = await storage.upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })

  if (error) return null

  const { data } = storage.getPublicUrl(path)
  return {
    path,
    publicUrl: data.publicUrl,
  }
}

export function getSiteMediaPublicUrl(path: string) {
  const { data } = createAdminClient().storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

