import type { AlbumPhoto } from '@/types'
import { getImageDisplayUrl, getImageThumbnailUrl, isQiniuImageUrl } from '@/lib/images/qiniu'

const HEIC_EXTENSION_PATTERN = /\.(hei[cf])(?:[?#].*)?$/i

function isHeicImage(src: string) {
  return HEIC_EXTENSION_PATTERN.test(src)
}

function canUseQiniuHeicTransform(src: string) {
  return isHeicImage(src) && isQiniuImageUrl(src)
}

export function getAlbumDisplayImageSrc(photo: AlbumPhoto) {
  if (photo.displayImage) return photo.displayImage
  if (canUseQiniuHeicTransform(photo.image)) {
    return getImageDisplayUrl(photo.image, 1600)
  }

  return getImageDisplayUrl(photo.image, 1600)
}

export function getAlbumThumbnailImageSrc(photo: AlbumPhoto) {
  if (photo.thumbnailImage) return photo.thumbnailImage
  if (canUseQiniuHeicTransform(photo.image)) {
    return getImageThumbnailUrl(photo.image, 240)
  }

  return getImageThumbnailUrl(photo.displayImage ?? photo.image, 240)
}

export function getAlbumPreviewImageSrc(photo: AlbumPhoto) {
  return getImageThumbnailUrl(photo.thumbnailImage ?? photo.displayImage ?? photo.image, 48)
}
