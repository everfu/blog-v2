// Album types
export interface AlbumPhoto {
  label?: string
  image: string
  displayImage?: string
  thumbnailImage?: string
  date?: string
  description?: string
  details?: Record<string, string | number>
}

export interface AlbumCategory {
  name: string
  label: string
  image: string
  url?: string
  list?: AlbumPhoto[]
}

// Hardware types
export interface HardwareItem {
  name: string
  image: string
  category: string
  description?: string
  url?: string
  recommended?: boolean
  wishlist?: boolean
}

// Software types
export interface SoftwareItem {
  name: string
  icon?: string
  image?: string
  description: string
  url?: string
  recommended?: boolean
}

export interface SoftwareCategory {
  slug: string
  name: string
  description?: string
  items: SoftwareItem[]
}

// Watched types
export interface WatchedItem {
  title: string
  rating: number
  year: string
  country: string
  genre: string
  director: string
  date: string
  image?: string
}
