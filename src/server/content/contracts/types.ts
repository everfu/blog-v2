import type { AlbumCategory, AlbumPhoto, HardwareItem, SoftwareCategory, SoftwareItem, WatchedItem } from '@/types'
import type { FeedEntry, FeedGroup, FriendItem, FriendSourceStatus, FriendsResponse } from '@/types/feed'
import type { ContentStatus, FriendApplicationStatus, Json, StackKind } from '@/types/supabase'

export type { AlbumCategory, AlbumPhoto, FeedEntry, FeedGroup, FriendItem, FriendSourceStatus, FriendsResponse, HardwareItem, SoftwareCategory, SoftwareItem, WatchedItem }

export interface HomeSection {
  id: string
  key: string
  title: string
  subtitle: string
  enabled: boolean
  sortOrder: number
  metadata: Json
}

export interface AdminContentBase {
  id: string
  status: ContentStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface AdminWatchedItem extends AdminContentBase, WatchedItem {
  imageUrl?: string
}

export interface AdminAlbumCategory extends AdminContentBase {
  slug: string
  label: string
  description: string
  coverImageUrl?: string
  photos: AdminAlbumPhoto[]
}

export interface AdminAlbumPhoto extends AdminContentBase {
  categoryId: string
  categoryLabel?: string
  label?: string
  imageUrl: string
  displayImageUrl?: string
  thumbnailImageUrl?: string
  takenAt?: string
  description?: string
  details: Json
}

export interface AdminStackCategory extends AdminContentBase {
  slug: string
  name: string
  kind: StackKind
  description: string
}

export interface AdminStackItem extends AdminContentBase {
  categoryId?: string
  categoryName?: string
  kind: StackKind
  name: string
  description: string
  itemCategory: string
  icon?: string
  imageUrl?: string
  url?: string
  recommended: boolean
  wishlist: boolean
}

export interface AdminFriendGroup extends AdminContentBase {
  slug: string
  name: string
  description: string
  links: AdminFriendLink[]
}

export interface AdminFriendLink extends AdminContentBase {
  groupId?: string
  groupName?: string
  author: string
  sitenick?: string
  description: string
  linkUrl: string
  feedUrl?: string
  feedMuted: boolean
  iconUrl?: string
  avatarUrl?: string
  archs: string[]
  joinedAt: string
  lastCheckedAt?: string
  lastError?: string
}

export interface FriendApplicationSettings {
  enabled: boolean
}

export interface AdminFriendApplication {
  id: string
  authorName: string
  siteName: string
  description: string
  siteUrl: string
  avatarUrl?: string
  feedUrl?: string
  contact: string
  note: string
  status: FriendApplicationStatus
  userAgent?: string
  createdAt: string
  updatedAt: string
}

export interface AdminHomeSection extends HomeSection {
  createdAt: string
  updatedAt: string
}
