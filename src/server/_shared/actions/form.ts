import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { Json } from '@/types/supabase'
import { uploadSiteMediaFile } from '@/server/_shared/storage/site-media'

export const statusSchema = z.enum(['draft', 'published', 'archived'])
export const optionalUrlSchema = z.string().trim().url().optional().or(z.literal(''))
export const optionalTextSchema = z.string().trim().optional().or(z.literal(''))

export function textOrNull(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function parseCsv(value?: string) {
  return (value || '').split(',').map(item => item.trim()).filter(Boolean)
}

export function parseJsonObject(value?: string, errorPath = '/admin/home?error=json'): Json {
  if (!value?.trim()) return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    redirect(errorPath)
  }
}

async function uploadImage(formData: FormData, fieldName: string, folder: string) {
  const file = formData.get(fieldName)
  if (!(file instanceof File) || file.size === 0) return null

  const uploaded = await uploadSiteMediaFile(file, folder)
  return uploaded?.publicUrl || null
}

export async function resolveImageUrl(formData: FormData, urlField: string, fileField: string, folder: string) {
  return await uploadImage(formData, fileField, folder) || textOrNull(String(formData.get(urlField) || ''))
}
