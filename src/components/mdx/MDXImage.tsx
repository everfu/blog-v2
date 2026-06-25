'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { OptimizedImage } from '@/components/common'
import { getImageDisplayUrl } from '@/lib/images/qiniu'

const MDXLightbox = dynamic(() => import('./MDXLightbox'), {
  ssr: false,
})

interface MDXImageProps {
  src: string
  alt?: string
}

export default function MDXImage({ src, alt }: MDXImageProps) {
  const [open, setOpen] = useState(false)
  const imageAlt = alt || ''
  const lightboxSrc = getImageDisplayUrl(src, 2400)

  return (
    <>
      <span className="block my-6">
        <OptimizedImage
          src={src}
          alt={imageAlt}
          width={800} 
          height={400} 
          sizes="(max-width: 780px) calc(100vw - 2rem), 716px"
          loading="lazy"
          qiniuQuality={82}
          className="w-full h-auto border border-border cursor-zoom-in hover:opacity-90 transition-opacity"
          onClick={() => setOpen(true)}
        />
        {alt && (
          <span className="block text-center text-xs text-muted mt-2">{alt}</span>
        )}
      </span>

      {open && (
        <MDXLightbox
          src={lightboxSrc}
          alt={imageAlt}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
