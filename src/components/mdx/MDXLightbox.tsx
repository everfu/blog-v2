'use client'

import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

interface MDXLightboxProps {
  src: string
  alt: string
  open: boolean
  onClose: () => void
}

export default function MDXLightbox({ src, alt, open, onClose }: MDXLightboxProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      slides={[{ src, alt }]}
      plugins={[Zoom]}
      animation={{ fade: 300 }}
      controller={{ closeOnBackdropClick: true }}
      styles={{
        container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        scrollToZoom: true,
      }}
      render={{
        buttonPrev: () => null,
        buttonNext: () => null,
      }}
    />
  )
}
