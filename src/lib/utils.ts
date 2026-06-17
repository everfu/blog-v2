import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 格式化日期为固定格式（用于服务端组件，避免 hydration 问题） */
export const formatDate = (date: string): string =>
  format(new Date(date), 'yyyy-MM-dd')

/** 分类颜色映射 */
const CATEGORY_COLORS: Record<string, string> = {
  TECH: 'text-blue-400',
  DAILY: 'text-purple-400',
  THOUGHTS: 'text-red-400',
}

export const getCategoryColor = (category?: string): string =>
  CATEGORY_COLORS[category?.toUpperCase() ?? ''] ?? 'text-muted'

export const getCategoryColorWithBorder = (category?: string): string => {
  const colors: Record<string, string> = {
    TECH: 'text-blue-400 border-blue-400/30',
    DAILY: 'text-purple-400 border-purple-400/30',
    THOUGHTS: 'text-red-400 border-red-400/30',
  }
  return colors[category?.toUpperCase() ?? ''] ?? 'text-muted border-border'
}

/** 格式化相对时间 */
export const formatTimeAgo = (date: string, addSuffix = false): string =>
  formatDistanceToNow(new Date(date), { addSuffix, locale: zhCN })

/** 计算阅读时间（假设每分钟阅读 300 字） */
export const getReadingTime = (content: string): number =>
  Math.max(1, Math.ceil(content.length / 300))
