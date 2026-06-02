import type { AlbumPhoto } from '@/types'

export type PhotoInfoItem = {
  label: string
  value: string
}

export type PhotoInfoStatus = 'loading' | 'ready' | 'empty' | 'error'

export type PhotoInfoState = {
  status: PhotoInfoStatus
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

function formatPlainValue(value: unknown) {
  if (typeof value === 'number') return Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(2))}`
  if (typeof value === 'string') return value
  return ''
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

function mergeInfoItems(exifItems: PhotoInfoItem[], manualItems: PhotoInfoItem[]) {
  const exifLabels = new Set(exifItems.map((item) => item.label))

  return [
    ...exifItems,
    ...manualItems.filter((item) => !exifLabels.has(item.label)),
  ]
}

async function fetchPhotoBuffer(url: string) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 7000)

  try {
    const response = await fetch(url, {
      cache: 'force-cache',
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

export function getInfoValue(info: PhotoInfoState | undefined, label: string) {
  if (info?.status !== 'ready') return undefined
  return info.items.find((item) => item.label === label)?.value
}

export async function readPhotoInfo(photo: AlbumPhoto): Promise<PhotoInfoState> {
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
    const items = mergeInfoItems(exifItems, manualItems)

    return items.length > 0 ? { status: 'ready', items } : { status: 'empty', items: [] }
  } catch {
    return manualItems.length > 0 ? { status: 'ready', items: manualItems } : { status: 'error', items: [] }
  }
}
