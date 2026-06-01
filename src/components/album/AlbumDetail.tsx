'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AlbumCategory, AlbumPhoto } from '@/types'

interface AlbumDetailProps {
  category: AlbumCategory | null
  onClose: () => void
}

type PhotoInfoItem = {
  label: string
  value: string
}

type PhotoInfoState = {
  status: 'loading' | 'ready' | 'empty' | 'error'
  items: PhotoInfoItem[]
}

type ExifrModule = {
  parse: (data: ArrayBuffer, options?: unknown) => Promise<unknown>
  default?: {
    parse: (data: ArrayBuffer, options?: unknown) => Promise<unknown>
  }
}

const BLOCKED_DETAIL_PATTERN = /(gps|latitude|longitude|altitude|address|location|city|country|province|state|street|位置|地点|地址|经纬|纬度|经度|海拔|城市|国家|省|州|街)/i
const SAFE_EXIF_KEYS = [
  'Make',
  'Model',
  'DateTimeOriginal',
  'CreateDate',
  'ModifyDate',
  'DateTime',
  'LensModel',
  'Lens',
  'LensInfo',
  'FocalLength',
  'FNumber',
  'ApertureValue',
  'ExposureTime',
  'ShutterSpeedValue',
  'ISO',
  'ISOSpeedRatings',
  'ExposureCompensation',
  'ExposureBiasValue',
  'ExifImageWidth',
  'PixelXDimension',
  'ImageWidth',
  'ExifImageHeight',
  'PixelYDimension',
  'ImageHeight',
  'Software',
]

function isSafeDetailLabel(label: string) {
  return !BLOCKED_DETAIL_PATTERN.test(label)
}

function firstValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function formatDateTime(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`
  }

  if (typeof value === 'string') {
    return value.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  }

  return formatPlainValue(value)
}

function formatPlainValue(value: unknown) {
  if (typeof value === 'number') return Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(2))}`
  if (typeof value === 'string') return value
  return ''
}

function formatFNumber(value: unknown) {
  if (typeof value === 'number') return `f/${Number(value.toFixed(1))}`
  if (typeof value === 'string') return value.startsWith('f/') ? value : `f/${value}`
  return ''
}

function formatFocalLength(value: unknown) {
  if (typeof value === 'number') return `${Number(value.toFixed(1))}mm`
  if (typeof value === 'string') return value.endsWith('mm') ? value : `${value}mm`
  return ''
}

function formatExposureTime(value: unknown) {
  if (typeof value === 'number') {
    if (value > 0 && value < 1) return `1/${Math.round(1 / value)}s`
    return `${Number(value.toFixed(2))}s`
  }
  return formatPlainValue(value)
}

function formatExposureBias(value: unknown) {
  if (typeof value === 'number') {
    const rounded = Number(value.toFixed(2))
    return `${rounded > 0 ? '+' : ''}${rounded} EV`
  }
  return formatPlainValue(value)
}

function addInfoItem(items: PhotoInfoItem[], label: string, value: unknown, formatter = formatPlainValue) {
  if (!isSafeDetailLabel(label)) return

  const formatted = formatter(value)
  if (formatted) items.push({ label, value: formatted })
}

function buildExifItems(tags: Record<string, unknown>) {
  const items: PhotoInfoItem[] = []
  const make = formatPlainValue(firstValue(tags, ['Make']))
  const model = formatPlainValue(firstValue(tags, ['Model']))
  const camera = make && model && model.toLowerCase().includes(make.toLowerCase())
    ? model
    : [make, model].filter(Boolean).join(' ')
  const width = firstValue(tags, ['ExifImageWidth', 'PixelXDimension', 'ImageWidth'])
  const height = firstValue(tags, ['ExifImageHeight', 'PixelYDimension', 'ImageHeight'])

  addInfoItem(items, '拍摄时间', firstValue(tags, ['DateTimeOriginal', 'CreateDate', 'ModifyDate', 'DateTime']), formatDateTime)
  addInfoItem(items, '相机', camera)
  addInfoItem(items, '镜头', firstValue(tags, ['LensModel', 'Lens', 'LensInfo']))
  addInfoItem(items, '焦距', firstValue(tags, ['FocalLength']), formatFocalLength)
  addInfoItem(items, '光圈', firstValue(tags, ['FNumber', 'ApertureValue']), formatFNumber)
  addInfoItem(items, '快门', firstValue(tags, ['ExposureTime', 'ShutterSpeedValue']), formatExposureTime)
  addInfoItem(items, 'ISO', firstValue(tags, ['ISO', 'ISOSpeedRatings']))
  addInfoItem(items, '曝光补偿', firstValue(tags, ['ExposureCompensation', 'ExposureBiasValue']), formatExposureBias)
  addInfoItem(items, '尺寸', width && height ? `${width} x ${height}` : '')
  addInfoItem(items, '软件', firstValue(tags, ['Software']))

  return items
}

function buildManualItems(photo: AlbumPhoto) {
  if (!photo.details) return []

  return Object.entries(photo.details)
    .filter(([label]) => isSafeDetailLabel(label))
    .map(([label, value]) => ({ label, value: String(value) }))
    .filter((item) => item.value.length > 0)
}

function getInfoValue(info: PhotoInfoState | undefined, label: string) {
  if (info?.status !== 'ready') return undefined
  return info.items.find((item) => item.label === label)?.value
}

async function fetchPhotoBuffer(url: string) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 7000)

  try {
    const response = await fetch(url, {
      mode: 'cors',
      signal: controller.signal,
    })

    if (!response.ok) throw new Error('Unable to read photo metadata')
    return await response.arrayBuffer()
  } finally {
    window.clearTimeout(timeout)
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Timed out reading photo metadata')), timeoutMs)

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeout))
  })
}

async function readPhotoInfo(photo: AlbumPhoto): Promise<PhotoInfoState> {
  const manualItems = buildManualItems(photo)

  try {
    const exifrModule = await withTimeout(import('exifr'), 4000) as unknown as ExifrModule
    const exifr = typeof exifrModule.parse === 'function' ? exifrModule : exifrModule.default
    if (!exifr) throw new Error('EXIF parser is unavailable')
    const buffer = await fetchPhotoBuffer(photo.image)
    const tags = await withTimeout(exifr.parse(buffer, {
      pick: SAFE_EXIF_KEYS,
      exif: true,
      gps: false,
      interop: false,
      iptc: false,
      jfif: true,
      tiff: true,
      xmp: false,
      icc: false,
      reviveValues: true,
      translateKeys: true,
      translateValues: true,
    }), 4000)
    const exifItems = tags ? buildExifItems(tags as Record<string, unknown>) : []
    const manualLabels = new Set(exifItems.map((item) => item.label))
    const items = [
      ...exifItems,
      ...manualItems.filter((item) => !manualLabels.has(item.label)),
    ]

    return items.length > 0 ? { status: 'ready', items } : { status: 'empty', items: [] }
  } catch {
    return manualItems.length > 0 ? { status: 'ready', items: manualItems } : { status: 'error', items: [] }
  }
}

export default function AlbumDetail({ category, onClose }: AlbumDetailProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [photoInfoByImage, setPhotoInfoByImage] = useState<Record<string, PhotoInfoState>>({})
  const requestedPhotoInfo = useRef<Set<string>>(new Set())

  const photos = useMemo(() => category?.list ?? [], [category?.list])

  const selectedPhoto = photos[selectedPhotoIndex]
  const selectedPhotoInfo = selectedPhoto ? photoInfoByImage[selectedPhoto.image] : undefined

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [isClosing, onClose])

  const selectPhoto = useCallback((index: number) => {
    setSelectedPhotoIndex(index)
  }, [])

  useEffect(() => {
    if (!category) return

    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => setIsVisible(true))

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [category, handleClose])

  useEffect(() => {
    if (!photos[selectedPhotoIndex] && selectedPhotoIndex !== 0) {
      setSelectedPhotoIndex(0)
    }
  }, [photos, selectedPhotoIndex])

  useEffect(() => {
    if (!selectedPhoto || requestedPhotoInfo.current.has(selectedPhoto.image)) return

    let active = true
    const image = selectedPhoto.image
    const loadingTimeout = window.setTimeout(() => {
      if (!active) return

      setPhotoInfoByImage(prev => {
        if (prev[image]?.status !== 'loading') return prev

        return {
          ...prev,
          [image]: { status: 'error', items: [] },
        }
      })
    }, 10000)

    requestedPhotoInfo.current.add(selectedPhoto.image)
    setPhotoInfoByImage(prev => ({
      ...prev,
      [image]: { status: 'loading', items: [] },
    }))

    readPhotoInfo(selectedPhoto).then((info) => {
      if (!active) return
      window.clearTimeout(loadingTimeout)
      setPhotoInfoByImage(prev => ({
        ...prev,
        [image]: info,
      }))
    }).catch(() => {
      if (!active) return
      window.clearTimeout(loadingTimeout)
      setPhotoInfoByImage(prev => ({
        ...prev,
        [image]: { status: 'error', items: [] },
      }))
    })

    return () => {
      active = false
      window.clearTimeout(loadingTimeout)
    }
  }, [selectedPhoto])

  if (!category) return null

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/90 z-50 overflow-y-auto transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <div className={`mx-auto max-w-7xl px-4 md:px-8 py-5 md:py-7 min-h-screen flex flex-col transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-mono text-white/45 mb-1">
                {photos.length} PHOTOS
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">{category.label}</h2>
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-2xl text-white/80 hover:text-white"
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          {photos.length > 0 && (
            <div className="min-h-0 flex-1 flex flex-col gap-4">
              <div className="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-5 min-h-0">
                <div className="relative min-h-[48vh] md:min-h-[58vh] lg:min-h-0 lg:h-[calc(100vh-220px)] bg-black border border-white/10 overflow-hidden">
                  {selectedPhoto && (
                    <Image
                      key={selectedPhoto.image}
                      src={selectedPhoto.image}
                      alt={selectedPhoto.label || category.label}
                      fill
                      sizes="(max-width: 1024px) calc(100vw - 2rem), calc(100vw - 420px)"
                      className="object-contain"
                      priority
                    />
                  )}
                </div>

              <PhotoInfoPanel
                photo={selectedPhoto}
                info={selectedPhotoInfo}
                className="lg:h-[calc(100vh-220px)]"
              />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    type="button"
                    key={`${photo.image}-${index}`}
                    className={`relative shrink-0 w-20 md:w-24 aspect-[4/3] overflow-hidden bg-black border-2 p-0.5 transition-opacity focus:outline-none focus-visible:border-white/70 ${
                      selectedPhotoIndex === index ? 'border-white opacity-100' : 'border-transparent opacity-55 hover:opacity-90'
                    }`}
                    onClick={() => selectPhoto(index)}
                    aria-label={`选择照片 ${photo.label || `第 ${index + 1} 张`}`}
                    aria-pressed={selectedPhotoIndex === index}
                  >
                    <Image
                      src={photo.image}
                      alt={photo.label || category.label}
                      fill
                      sizes="96px"
                      className="object-contain p-0.5"
                      loading={index < 8 ? 'eager' : 'lazy'}
                    />
                    <span className="absolute left-1.5 bottom-1 text-[10px] font-mono text-white/75 drop-shadow">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {photos.length === 0 && (
            <div className="text-center py-20 border border-white/10">
              <p className="text-white/50">暂无照片</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface PhotoInfoPanelProps {
  photo?: AlbumPhoto
  info?: PhotoInfoState
  className?: string
}

function PhotoInfoPanel({ photo, info, className = '' }: PhotoInfoPanelProps) {
  const capturedAt = getInfoValue(info, '拍摄时间') ?? photo?.date

  return (
    <aside className={`bg-white/[0.06] border border-white/10 text-white shadow-2xl overflow-hidden ${className}`}>
      <div className="p-4 border-b border-white/10">
        {photo?.label && <h3 className="text-sm font-semibold leading-tight">{photo.label}</h3>}
        {capturedAt && <p className="text-[11px] font-mono text-white/55 mt-1">{capturedAt}</p>}
        {photo?.description && (
          <p className="text-xs text-white/70 leading-relaxed mt-2">{photo.description}</p>
        )}
      </div>

      <div className="p-4 max-h-[36vh] lg:max-h-[calc(100%-72px)] overflow-y-auto">
        {(info?.status === 'loading' || info?.status === 'empty' || info?.status === 'error' || !info) && (
          <p className="text-xs text-white/55">暂无可用拍摄信息</p>
        )}
        {info?.status === 'ready' && (
          <dl className="grid grid-cols-[72px_1fr] gap-x-3 gap-y-1.5 text-xs">
            {info.items.map((item) => (
              <div key={item.label} className="contents">
                <dt className="text-white/45">{item.label}</dt>
                <dd className="text-white/80 break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </aside>
  )
}
