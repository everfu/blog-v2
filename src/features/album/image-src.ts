import type { AlbumPhoto } from '@/types'

const HEIC_EXTENSION_PATTERN = /\.(hei[cf])(?:[?#].*)?$/i
const QINIU_IMAGE_HOSTS = new Set(['cdn.lightxi.com'])

function isHeicImage(src: string) {
  return HEIC_EXTENSION_PATTERN.test(src)
}

function isQiniuImage(src: string) {
  try {
    return QINIU_IMAGE_HOSTS.has(new URL(src).hostname)
  } catch {
    return false
  }
}

function withQiniuImageProcess(src: string, process: string) {
  return `${src}${src.includes('?') ? '&' : '?'}${process}`
}

function canUseQiniuHeicTransform(src: string) {
  return isHeicImage(src) && isQiniuImage(src)
}

export function getAlbumDisplayImageSrc(photo: AlbumPhoto) {
  if (photo.displayImage) return photo.displayImage
  if (canUseQiniuHeicTransform(photo.image)) {
    return withQiniuImageProcess(photo.image, 'imageMogr2/thumbnail/1600x/format/webp')
  }

  return photo.image
}

export function getAlbumThumbnailImageSrc(photo: AlbumPhoto) {
  if (photo.thumbnailImage) return photo.thumbnailImage
  if (canUseQiniuHeicTransform(photo.image)) {
    return withQiniuImageProcess(photo.image, 'imageView2/2/w/240/format/webp')
  }

  return photo.displayImage ?? photo.image
}
