import { cn } from '@/lib/utils'

export function SkeletonLine({ className }: { className: string }) {
  return <span className={cn('block animate-pulse bg-border', className)} aria-hidden="true" />
}
