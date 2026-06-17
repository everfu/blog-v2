import { cn } from '@/lib/utils'

interface PostStatsProps {
  viewCount: number
  likeCount: number
  className?: string
}

export default function PostStats({ viewCount, likeCount, className = '' }: PostStatsProps) {
  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted', className)}>
      <span className="inline-flex items-center gap-1">
        <span className="i-lucide-eye text-[11px]" />
        {viewCount}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="i-lucide-heart text-[11px]" />
        {likeCount}
      </span>
    </div>
  )
}
