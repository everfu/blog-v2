import type { ImageLoaderProps } from 'next/image'

export type QiniuImageMode = 'fit' | 'cover'

interface QiniuImageVariantOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp'
  mode?: QiniuImageMode
  blur?: boolean
}

const DEFAULT_QINIU_IMAGE_HOSTS = ['cdn.lightxi.com']
const GIF_OR_SVG_PATTERN = /\.(gif|svg)(?:[?#].*)?$/i
const QINIU_PROCESS_PATTERN = /(?:^|[?&])(?:imageView2|imageMogr2)\//

function getConfiguredQiniuHosts() {
  return (process.env.NEXT_PUBLIC_QINIU_IMAGE_HOSTS || '')
    .split(',')
    .map(host => host.trim().toLowerCase())
    .filter(Boolean)
}

const qiniuImageHosts = new Set([
  ...DEFAULT_QINIU_IMAGE_HOSTS,
  ...getConfiguredQiniuHosts(),
])

function canTransformImage(src: string) {
  return !GIF_OR_SVG_PATTERN.test(src) && !QINIU_PROCESS_PATTERN.test(src)
}

function withProcess(src: string, process: string) {
  return `${src}${src.includes('?') ? '&' : '?'}${process}`
}

function clampPositiveInteger(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined
  return Math.round(value)
}

function clampQuality(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(100, Math.max(1, Math.round(value)))
}

export function isQiniuImageUrl(src: string): boolean {
  try {
    return qiniuImageHosts.has(new URL(src).hostname.toLowerCase())
  } catch {
    return false
  }
}

export function getQiniuImageVariant(src: string, options: QiniuImageVariantOptions = {}) {
  if (!isQiniuImageUrl(src) || !canTransformImage(src)) return src

  const width = clampPositiveInteger(options.width)
  const height = clampPositiveInteger(options.height)
  const quality = clampQuality(options.quality)
  const mode = options.mode || 'fit'
  const parts = ['imageView2', mode === 'cover' ? '1' : '2']

  if (width) parts.push('w', String(width))
  if (height) parts.push('h', String(height))
  if (options.blur) parts.push('blur', '1x8')
  if (options.format) parts.push('format', options.format)
  if (quality) parts.push('q', String(quality))

  return withProcess(src, parts.join('/'))
}

export function getImageThumbnailUrl(src: string, width = 240) {
  return getQiniuImageVariant(src, {
    width,
    quality: 75,
    format: 'webp',
    mode: 'cover',
  })
}

export function getImageDisplayUrl(src: string, width = 1200) {
  return getQiniuImageVariant(src, {
    width,
    quality: 82,
    format: 'webp',
    mode: 'fit',
  })
}

export function getImagePreviewUrl(src: string) {
  return getQiniuImageVariant(src, {
    width: 32,
    quality: 45,
    format: 'webp',
    mode: 'fit',
    blur: true,
  })
}

export function getBackgroundImageUrl(src: string, width: number) {
  return getQiniuImageVariant(src, {
    width,
    quality: 76,
    format: 'webp',
    mode: 'cover',
  })
}

export function qiniuImageLoader({ src, width, quality }: ImageLoaderProps) {
  return getQiniuImageVariant(src, {
    width,
    quality: quality || 80,
    format: 'webp',
    mode: 'fit',
  })
}
