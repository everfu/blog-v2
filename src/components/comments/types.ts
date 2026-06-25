import type { FormEvent, RefObject, ReactNode } from 'react'
import type { PublicComment } from '@/server/comments/contracts/types'

export interface CommentProps {
  path: string
  postId?: string
  className?: string
}

export interface CommentFormState {
  authorName: string
  email: string
  website: string
  body: string
}

export interface EmojiItem {
  text: string
  icon: string
}

export interface EmojiCategory {
  type: 'image' | 'text' | 'emoji' | 'emoticon'
  container: EmojiItem[]
}

export type EmojiPack = Record<string, EmojiCategory>

export interface EmojiPickerCategory {
  name: string
  type: EmojiCategory['type']
  items: Array<EmojiItem & { key: string, shortcode: string }>
}

export interface EmojiImageToken {
  name: string
  icon: string
  label: string
}

export interface CommentFormProps {
  form: CommentFormState
  emojiPacks: EmojiPack[]
  isSubmitting: boolean
  replyTo: PublicComment | null
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onChange: (patch: Partial<CommentFormState>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancelReply: () => void
  className?: string
}

export interface CommentItemProps {
  comment: PublicComment
  replies: PublicComment[]
  isLiked: (comment: PublicComment) => boolean
  emojiImages: Map<string, EmojiImageToken>
  onReply: (comment: PublicComment) => void
  onLike: (comment: PublicComment) => void
  activeReplyForm?: (comment: PublicComment) => ReactNode
}
