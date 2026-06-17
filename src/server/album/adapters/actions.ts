'use server'

import {
  deleteAlbumPhoto as deleteAlbumPhotoCommand,
  saveAlbumCategory as saveAlbumCategoryCommand,
  saveAlbumPhoto as saveAlbumPhotoCommand,
} from '@/server/content/application/actions'
import type { CurrentAdmin } from '@/lib/auth/admin'

export async function saveAlbumCategory(admin: CurrentAdmin, formData: FormData) {
  return saveAlbumCategoryCommand(admin, formData)
}

export async function saveAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  return saveAlbumPhotoCommand(admin, formData)
}

export async function deleteAlbumPhoto(admin: CurrentAdmin, formData: FormData) {
  return deleteAlbumPhotoCommand(admin, formData)
}
