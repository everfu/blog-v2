import type { NextRequest } from 'next/server'

export interface CommentLocationInfo {
  label: string
  country: string | null
  region: string | null
  city: string | null
}

export interface CommentUserAgentInfo {
  browser: string | null
  browserVersion?: string | null
  os: string | null
  device: string | null
}

function readHeader(request: NextRequest, names: string[]) {
  for (const name of names) {
    const value = request.headers.get(name)
    if (value?.trim()) return decodeURIComponent(value.trim())
  }

  return null
}

export function getCommentLocation(request: NextRequest): CommentLocationInfo {
  const country = readHeader(request, ['x-vercel-ip-country', 'cf-ipcountry', 'x-real-ip-country'])
  const region = readHeader(request, ['x-vercel-ip-country-region', 'x-real-ip-region'])
  const city = readHeader(request, ['x-vercel-ip-city', 'x-real-ip-city'])

  return {
    label: formatLocationLabel({ country, region, city }),
    country,
    region,
    city,
  }
}

function formatLocationLabel({
  country,
  region,
  city,
}: {
  country?: string | null
  region?: string | null
  city?: string | null
}) {
  const normalizedRegion = region?.trim() || ''
  const normalizedCountry = country?.trim() || ''
  const normalizedCity = city?.trim() || ''

  if (normalizedRegion) return normalizedRegion
  if (normalizedCity) return normalizedCity
  if (normalizedCountry) return normalizedCountry
  return '未知'
}

function formatVersion(value: string | undefined) {
  if (!value) return ''
  return value.split('.').slice(0, 3).join('.')
}

function parseBrowser(userAgent: string) {
  const edge = userAgent.match(/Edg\/([\d.]+)/)
  if (edge) return { browser: 'Edge', browserVersion: formatVersion(edge[1]) }

  const opera = userAgent.match(/OPR\/([\d.]+)/)
  if (opera) return { browser: 'Opera', browserVersion: formatVersion(opera[1]) }

  const chrome = userAgent.match(/Chrome\/([\d.]+)/)
  if (chrome && !/Chromium\//.test(userAgent)) return { browser: 'Chrome', browserVersion: formatVersion(chrome[1]) }

  const firefox = userAgent.match(/Firefox\/([\d.]+)/)
  if (firefox) return { browser: 'Firefox', browserVersion: formatVersion(firefox[1]) }

  const safari = userAgent.match(/Version\/([\d.]+).*Safari\//)
  if (safari) return { browser: 'Safari', browserVersion: formatVersion(safari[1]) }

  return null
}

function normalizePlatformName(value?: string | null) {
  const normalized = value?.trim()
  if (!normalized) return null
  if (/mac/i.test(normalized)) return 'macOS'
  if (/ios|iphone|ipad/i.test(normalized)) return 'iOS'
  if (/windows/i.test(normalized)) return 'Windows'
  if (/android/i.test(normalized)) return 'Android'
  if (/linux/i.test(normalized)) return 'Linux'
  return normalized
}

function formatOs(platform?: string | null, version?: string | null) {
  const name = normalizePlatformName(platform)
  const normalizedVersion = version?.trim().replace(/_/g, '.') || ''
  if (!name) return normalizedVersion || null
  return normalizedVersion ? `${name} ${normalizedVersion}` : name
}

function formatMacOsVersion(value: string) {
  const normalized = value.replace(/_/g, '.')
  return normalized.startsWith('10.') ? normalized.slice(3) : normalized
}

function parseOs(userAgent: string) {
  if (/Windows NT 10/.test(userAgent)) return 'Windows 10/11'
  if (/Windows NT/.test(userAgent)) return 'Windows'
  const mac = userAgent.match(/Mac OS X ([\d_]+)/)
  if (mac) return formatOs('macOS', formatMacOsVersion(mac[1]))
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  if (/Android/.test(userAgent)) return 'Android'
  if (/Linux/.test(userAgent)) return 'Linux'
  return null
}

function parseDevice(userAgent: string) {
  if (/iPad|Tablet|Android(?!.*Mobile)/.test(userAgent)) return '平板'
  if (/Mobile|iPhone|Android/.test(userAgent)) return '手机'
  return '桌面'
}

export function parseUserAgent(userAgent: string | null): CommentUserAgentInfo {
  if (!userAgent) {
    return { browser: null, os: null, device: null }
  }

  const browser = parseBrowser(userAgent)

  return {
    browser: browser?.browser || null,
    browserVersion: browser?.browserVersion || null,
    os: parseOs(userAgent),
    device: parseDevice(userAgent),
  }
}

export function buildUserAgentSummary(info: CommentUserAgentInfo) {
  const browser = [info.browser, info.browserVersion].filter(Boolean).join(' ').trim()
  return [info.os, browser].filter(Boolean).join(' · ') || null
}
