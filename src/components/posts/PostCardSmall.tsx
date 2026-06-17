import Link from 'next/link'
import type { PostMetadata } from '@/server/posts/contracts/types'
import { getPostHref } from '@/server/posts/contracts/routes'
import { formatDate, getCategoryColor } from '@/lib/utils'
import PostStats from './PostStats'

interface PostCardSmallProps {
  post: PostMetadata
}

export default function PostCardSmall({ post }: PostCardSmallProps) {
  const dateStr = formatDate(post.date)

  return (
    <Link href={getPostHref(post)} className="block">
      <article className="group card p-4 min-h-[120px] flex flex-col justify-between">
        {/* 顶部：REC 标签和标题 */}
        <div className="flex items-center gap-3 mb-3">
          {post.recent && (
            <div className="flex items-center gap-1 bg-gray-600 px-1 py-1 rounded-md flex-shrink-0">
              <span className="i-lucide-star text-white text-xs" style={{ fill: 'currentColor' }}></span>
              <span className="text-white text-badge uppercase tracking-wide">REC</span>
            </div>
          )}
          <h3 className="text-md font-medium leading-relaxed text-foreground group-hover:opacity-60 transition-opacity flex-1">
            {post.title}
          </h3>
        </div>

        {/* 底部：时间分类 和 阅读 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <time className="text-xs text-muted">
              {dateStr}
            </time>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${getCategoryColor(post.category)}`}>
              {post.category || 'DAILY'}
            </span>
          </div>
          <PostStats viewCount={post.viewCount} likeCount={post.likeCount} />
        </div>
      </article>
    </Link>
  )
}
