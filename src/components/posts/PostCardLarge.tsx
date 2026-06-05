import Link from 'next/link'
import Image from 'next/image'
import type { PostMetadata } from '@/features/posts'
import { getPostHref } from '@/features/posts/routes'
import { formatDate } from '@/lib/utils'

interface PostCardLargeProps {
  post: PostMetadata
}

export default function PostCardLarge({ post }: PostCardLargeProps) {
  const dateStr = formatDate(post.date)

  return (
    <Link href={getPostHref(post)} className="block">
      <article className="group card min-h-[280px] flex flex-col overflow-hidden md:min-h-[220px] md:flex-row">
        <div className="flex flex-col justify-center px-6 py-7 md:w-[52%] md:px-7 md:py-8">
          <div className="mb-4 flex items-center gap-2 text-muted">
            <span className="i-lucide-calendar text-sm"></span>
            <time className="text-sm font-medium">
              {dateStr}
            </time>
          </div>

          <h3 className="mb-5 text-xl font-bold leading-tight text-foreground transition-opacity group-hover:opacity-70 md:text-[1.35rem]">
            {post.title}
          </h3>

          <p className="text-sm font-medium leading-loose text-muted">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-center px-6 pb-7 md:w-[48%] md:px-6 md:py-8">
          <div className="relative min-h-[160px] w-full overflow-hidden bg-background aspect-[16/9]">
            {post.cover ? (
              <Image
                src={post.cover} 
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={post.cover.endsWith('.gif')}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[160px] items-center justify-center">
                <div className="i-lucide-image text-4xl opacity-20 text-muted"></div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
