import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { getAllPosts, getPostBySlug, getPostHref } from '@/server/posts/adapters/page'
import { remarkCallout } from '@/lib/remarkCallout'
import { extractHeadings } from '@/lib/extractHeadings'
import { formatDate, getReadingTime, getCategoryColorWithBorder } from '@/lib/utils'
import { SectionDivider } from '@/components/common'
import { mdxComponents } from '@/components/mdx'
import { PostMetrics, PostReactions, TableOfContents } from '@/components/posts'
import { Comment } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { absoluteUrl, toIsoDate } from '@/config/site-utils'

interface PageProps {
  params: Promise<{
    year: string
    slug: string
  }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps) {
  const { year, slug } = await params
  const post = await getPostBySlug(year, slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const postUrl = absoluteUrl(getPostHref(post))
  const ogImage = absoluteUrl(post.cover || siteConfig.assets.ogImage)

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: siteConfig.author.name }],
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: toIsoDate(post.date),
      authors: [siteConfig.author.name],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { year, slug } = await params
  const [allPosts, post] = await Promise.all([
    getAllPosts(),
    getPostBySlug(year, slug),
  ])

  if (!post) {
    notFound()
  }

  // 获取下一篇文章
  const currentIndex = allPosts.findIndex(p => p.year === year && p.slug === slug)
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  const dateStr = formatDate(post.date)
  const readingTime = getReadingTime(post.content)
  const headings = extractHeadings(post.content)

  return (
    <div className="space-y-0 site-shell--article">
      <section>
        <div className="mx-4 md:mx-8 py-4">
          <Link 
            href="/posts"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <span className="i-lucide-arrow-left text-xs" />
            Back to Posts
          </Link>
        </div>
        <SectionDivider />
      </section>

      {/* Article Header */}
      <section>
        <div className="mx-4 md:mx-8 py-4">
          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-4">
            <span className="inline-flex items-center gap-1">
              <span className="i-lucide-calendar text-[10px]" />
              {dateStr}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="i-lucide-clock text-[10px]" />
              {readingTime} 分钟
            </span>
            {post.category && (
              <span className={`rounded border px-2 py-0.5 text-xs ${getCategoryColorWithBorder(post.category)}`}>
                {post.category}
              </span>
            )}
            <PostMetrics
              postId={post.id}
              initialViewCount={post.viewCount}
              initialLikeCount={post.likeCount}
              readonly
            />
          </div>

          {/* Title and Cover */}
          <div className="flex gap-6">
            <div className="flex-1">
              <h1 
                className="text-xl md:text-2xl font-bold leading-tight mb-3 bg-gradient-to-r from-foreground to-muted bg-clip-text text-transparent"
              >
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-sm text-muted leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </div>
            {/* Cover Image */}
            {post.cover ? (
              <div className="hidden md:block w-70 h-40 border border-border flex-shrink-0 bg-card overflow-hidden relative">
                <Image
                  src={post.cover} 
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 0vw, 280px"
                  unoptimized={post.cover.endsWith('.gif')}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="hidden md:flex w-32 h-24 flex-shrink-0 bg-card rounded items-center justify-center">
                <span className="i-lucide-image text-2xl text-muted" />
              </div>
            )}
          </div>
        </div>
        <SectionDivider />
      </section>

      {/* Article Content - desktop side rails bind to the content grid */}
      <section className="article-content-shell">
        <aside
          aria-label="文章表情反应"
          className="article-reaction-rail"
        >
          <PostReactions
            postId={post.id}
            initialReactions={post.reactions ?? {}}
          />
        </aside>

        <article className="article-reading-column">
          <div className="px-4 pb-8 pt-7 md:px-8 mdx-content">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm, remarkDirective, remarkCallout],
                },
              }}
            />
            {/* 移动端：底部 emoji 表情（水平排列） */}
            <div className="xl:hidden mt-8 pt-6 border-t border-border">
              <PostReactions
                postId={post.id}
                initialReactions={post.reactions ?? {}}
              />
            </div>
          </div>
        </article>

        <aside className="article-toc-rail">
          <TableOfContents headings={headings} />
        </aside>
      </section>

      {/* 移除底部 PostMetrics footer 爱心 */}

      <SectionDivider />

      {/* Next Post Navigation */}
      {nextPost && (
        <section>
          <Link 
            href={getPostHref(nextPost)}
            className="block mx-4 md:mx-8 py-8 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="text-xs text-muted mb-2 block">Next Post</span>
                <h3 className="text-lg font-semibold text-foreground group-hover:opacity-70 transition-opacity">
                  {nextPost.title}
                </h3>
                <span className="text-xs text-muted mt-1 block">
                  {format(new Date(nextPost.date), 'MMM dd, yyyy')}
                </span>
              </div>
              <span className="i-lucide-arrow-right text-muted group-hover:text-foreground transition-colors" />
            </div>
          </Link>
          <SectionDivider />
        </section>
      )}

      <Comment path={getPostHref(post)} postId={post.id} />
    </div>
  )
}
