import { SkeletonLine } from './SkeletonLine'

export function CommentListSkeleton() {
  return (
    <div className="border-b border-border" aria-label="评论加载中">
      {Array.from({ length: 2 }).map((_, index) => (
        <article key={index} className="flex gap-3 border-t border-border py-5">
          <SkeletonLine className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-3 w-32" />
            </div>
            <div className="mt-4 grid gap-2">
              <SkeletonLine className="h-3 w-full max-w-[92%]" />
              <SkeletonLine className="h-3 w-full max-w-[68%]" />
            </div>
            <div className="mt-4 flex gap-3">
              <SkeletonLine className="h-3 w-10" />
              <SkeletonLine className="h-3 w-12" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
