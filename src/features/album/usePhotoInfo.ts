'use client'

import { useEffect, useRef, useState } from 'react'
import type { AlbumPhoto } from '@/types'
import { readPhotoInfo, type PhotoInfoState } from './photo-info'

const photoInfoRequests = new Map<string, Promise<PhotoInfoState>>()
const photoInfoResults = new Map<string, PhotoInfoState>()

function requestIdleWork(callback: () => void) {
  const requestIdle = window.requestIdleCallback
  const cancelIdle = window.cancelIdleCallback

  if (typeof requestIdle === 'function' && typeof cancelIdle === 'function') {
    const id = requestIdle(callback, { timeout: 1500 })
    return () => cancelIdle(id)
  }

  const id = window.setTimeout(callback, 250)
  return () => window.clearTimeout(id)
}

function loadPhotoInfo(photo: AlbumPhoto) {
  const cachedResult = photoInfoResults.get(photo.image)
  if (cachedResult) return Promise.resolve(cachedResult)

  const cachedRequest = photoInfoRequests.get(photo.image)
  if (cachedRequest) return cachedRequest

  const request = readPhotoInfo(photo)
    .then((info) => {
      photoInfoResults.set(photo.image, info)
      photoInfoRequests.delete(photo.image)
      return info
    })
    .catch((error) => {
      photoInfoRequests.delete(photo.image)
      throw error
    })

  photoInfoRequests.set(photo.image, request)
  return request
}

export function usePhotoInfo(photo?: AlbumPhoto) {
  const [photoInfo, setPhotoInfo] = useState<PhotoInfoState | undefined>()
  const activeRequestId = useRef(0)

  useEffect(() => {
    if (!photo) {
      setPhotoInfo(undefined)
      return
    }

    let active = true
    const requestId = activeRequestId.current + 1
    activeRequestId.current = requestId
    const image = photo.image
    const cachedResult = photoInfoResults.get(image)

    if (cachedResult) {
      setPhotoInfo(cachedResult)
      return
    }

    const loadingTimeout = window.setTimeout(() => {
      if (!active || activeRequestId.current !== requestId) return
      setPhotoInfo(current => current?.status === 'loading' ? { status: 'error', items: [] } : current)
    }, 10000)

    setPhotoInfo({ status: 'loading', items: [] })

    const cancelIdleWork = requestIdleWork(() => {
      loadPhotoInfo(photo).then((info) => {
        if (!active || activeRequestId.current !== requestId) return
        window.clearTimeout(loadingTimeout)
        setPhotoInfo(info)
      }).catch(() => {
        if (!active || activeRequestId.current !== requestId) return
        window.clearTimeout(loadingTimeout)
        setPhotoInfo({ status: 'error', items: [] })
      })
    })

    return () => {
      active = false
      cancelIdleWork()
      window.clearTimeout(loadingTimeout)
    }
  }, [photo])

  return photoInfo
}
