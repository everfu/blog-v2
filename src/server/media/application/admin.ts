import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_MEDIA_BUCKET, getSiteMediaPublicUrl } from '@/server/_shared/storage/site-media'
import type { AdminMediaAsset } from '../contracts/types'

export const MEDIA_BUCKET = SITE_MEDIA_BUCKET
export const MEDIA_FOLDERS = ['all', 'posts', 'album', 'watched', 'stack', 'friends', 'uploads'] as const
export type AdminMediaFolder = typeof MEDIA_FOLDERS[number]

const LIST_LIMIT = 100

function toPublicAsset(folder: string, item: {
  name: string
  created_at?: string | null
  updated_at?: string | null
  metadata?: Record<string, unknown> | null
}): AdminMediaAsset {
  const path = folder ? `${folder}/${item.name}` : item.name
  return {
    name: item.name,
    path,
    publicUrl: getSiteMediaPublicUrl(path),
    folder: folder || 'root',
    size: typeof item.metadata?.size === 'number' ? item.metadata.size : null,
    mimeType: typeof item.metadata?.mimetype === 'string' ? item.metadata.mimetype : null,
    createdAt: item.created_at || null,
    updatedAt: item.updated_at || null,
  }
}

async function listFolder(folder: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(MEDIA_BUCKET).list(folder, {
    limit: LIST_LIMIT,
    offset: 0,
    sortBy: { column: 'updated_at', order: 'desc' },
  })

  if (error || !data) return []

  return data
    .filter(item => item.name && item.id)
    .map(item => toPublicAsset(folder, item))
}

export async function getAdminMediaAssets(folder: string = 'all'): Promise<AdminMediaAsset[]> {
  if (!isSupabaseAdminConfigured) return []

  const normalizedFolder = MEDIA_FOLDERS.includes(folder as AdminMediaFolder) ? folder : 'all'
  const folders = normalizedFolder === 'all' ? MEDIA_FOLDERS.filter(item => item !== 'all') : [normalizedFolder]
  const assets = (await Promise.all(folders.map(item => listFolder(item)))).flat()

  return assets.sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt || ''
    const bTime = b.updatedAt || b.createdAt || ''
    return bTime.localeCompare(aTime)
  })
}

export function getMediaFolderLabel(folder: string) {
  const labels: Record<string, string> = {
    all: '全部',
    posts: '文章',
    album: '相册',
    watched: '电影',
    stack: '硬件与软件',
    friends: '友链',
    uploads: '临时上传',
    root: '根目录',
  }

  return labels[folder] || folder
}
