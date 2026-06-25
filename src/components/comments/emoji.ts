import { normalizeEmojiIconSource } from '@/server/comments/contracts/emoji'
import type { EmojiImageToken, EmojiPack, EmojiPickerCategory } from './types'

function normalizeEmojiShortcode(value: string, fallback: string) {
  const normalized = value
    .trim()
    .replace(/^::|::$/g, '')
    .replace(/\s+/g, '-')
    .replace(/:/g, '')

  return normalized || fallback
}

export function getEmojiCategories(emojiPacks: EmojiPack[]): EmojiPickerCategory[] {
  return emojiPacks.flatMap(pack => Object.entries(pack).map(([name, category]) => ({
    name,
    type: category.type,
    items: category.container.map((item, index) => {
      const icon = normalizeEmojiIconSource(item.icon)

      return {
        ...item,
        icon,
        key: `${name}-${index}-${icon}`,
        shortcode: normalizeEmojiShortcode(item.text || '', `${name}-${index + 1}`),
      }
    }),
  })))
}

export function getEmojiImageTokens(emojiPacks: EmojiPack[]) {
  const tokens = new Map<string, EmojiImageToken>()

  getEmojiCategories(emojiPacks)
    .filter(category => category.type === 'image')
    .forEach(category => {
      category.items.forEach(item => {
        tokens.set(item.shortcode, {
          name: item.shortcode,
          icon: item.icon,
          label: item.text || item.shortcode,
        })
      })
    })

  return tokens
}
