'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getAlbumDisplayImageSrc } from '@/features/album/image-src'
import { usePhotoInfo } from '@/features/album/usePhotoInfo'
import type { AlbumCategory } from '@/types'
import AlbumEmptyState from './AlbumEmptyState'
import AlbumInfoPanel from './AlbumInfoPanel'
import AlbumPhotoViewer from './AlbumPhotoViewer'
import AlbumThumbnailStrip from './AlbumThumbnailStrip'

interface AlbumDetailProps {
  category: AlbumCategory | null
  onClose: () => void
}

export default function AlbumDetail({ category, onClose }: AlbumDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const photos = useMemo(() => category?.list ?? [], [category?.list])
  const selectedPhoto = photos[selectedPhotoIndex]
  const selectedPhotoInfo = usePhotoInfo(selectedPhoto)

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setIsVisible(false)
    window.setTimeout(onClose, 300)
  }, [isClosing, onClose])

  const selectPhoto = useCallback((index: number) => {
    setSelectedPhotoIndex(index)
  }, [])

  const showPreviousPhoto = useCallback(() => {
    if (photos.length === 0) return
    setSelectedPhotoIndex(current => (current - 1 + photos.length) % photos.length)
  }, [photos.length])

  const showNextPhoto = useCallback(() => {
    if (photos.length === 0) return
    setSelectedPhotoIndex(current => (current + 1) % photos.length)
  }, [photos.length])

  useEffect(() => {
    if (!category) return

    setSelectedPhotoIndex(0)
    setIsClosing(false)
    setIsVisible(false)
    requestAnimationFrame(() => setIsVisible(true))
  }, [category])

  useEffect(() => {
    if (!category) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPreviousPhoto()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNextPhoto()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [category, handleClose, showNextPhoto, showPreviousPhoto])

  useEffect(() => {
    if (!photos[selectedPhotoIndex] && selectedPhotoIndex !== 0) {
      setSelectedPhotoIndex(0)
    }
  }, [photos, selectedPhotoIndex])

  useEffect(() => {
    if (photos.length < 2) return

    const adjacentPhotos = [
      photos[(selectedPhotoIndex - 1 + photos.length) % photos.length],
      photos[(selectedPhotoIndex + 1) % photos.length],
    ]

    adjacentPhotos.forEach((photo) => {
      const image = new window.Image()
      image.decoding = 'async'
      image.src = getAlbumDisplayImageSrc(photo)
    })
  }, [photos, selectedPhotoIndex])

  if (!category) return null

  return createPortal(
    <div
      className={`album-detail-backdrop fixed inset-0 z-50 overflow-y-auto text-foreground backdrop-blur-xl transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <div className={`mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-5 transition-all duration-300 md:px-8 md:py-7 xl:px-10 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 font-mono text-[11px] text-muted">
              {photos.length} PHOTOS
            </p>
            <h2 className="text-xl font-bold tracking-wide text-foreground md:text-2xl">{category.label}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="album-detail-panel flex h-10 w-10 shrink-0 items-center justify-center border border-border text-xl text-muted shadow-lg backdrop-blur-md transition-colors hover:border-primary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="关闭"
          >
            <span className="i-lucide-x" aria-hidden="true" />
          </button>
        </div>

        {photos.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="grid min-h-0 gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
              <AlbumPhotoViewer category={category} photo={selectedPhoto} />
              <AlbumInfoPanel
                photo={selectedPhoto}
                info={selectedPhotoInfo}
                className="lg:h-[calc(100vh-220px)]"
              />
            </div>

            <AlbumThumbnailStrip
              category={category}
              photos={photos}
              selectedPhotoIndex={selectedPhotoIndex}
              onSelectPhoto={selectPhoto}
            />
          </div>
        ) : (
          <AlbumEmptyState />
        )}
      </div>
    </div>,
    document.body,
  )
}
