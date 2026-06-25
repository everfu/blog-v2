'use client'

import Image, { type ImageProps } from 'next/image'
import { getImagePreviewUrl, isQiniuImageUrl, qiniuImageLoader } from '@/lib/images/qiniu'

type OptimizedImageProps = ImageProps & {
  qiniuQuality?: number
  withPreview?: boolean
}

export function OptimizedImage({
  src,
  alt,
  qiniuQuality,
  withPreview = true,
  placeholder,
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const srcString = typeof src === 'string' ? src : ''
  const isQiniu = Boolean(srcString && isQiniuImageUrl(srcString))
  const shouldPreview = isQiniu && withPreview && !placeholder && !blurDataURL

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      loader={isQiniu ? qiniuImageLoader : undefined}
      quality={isQiniu ? qiniuQuality : props.quality}
      placeholder={shouldPreview ? 'blur' : placeholder}
      blurDataURL={shouldPreview ? getImagePreviewUrl(srcString) : blurDataURL}
    />
  )
}
