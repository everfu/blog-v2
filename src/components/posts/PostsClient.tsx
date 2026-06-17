'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PostMetadata } from '@/server/posts/contracts/types'
import PostCardSmall from './PostCardSmall'

const POSTS_PER_PAGE = 8
const SCROLL_THRESHOLD = 1000

interface PostsClientProps {
  posts: PostMetadata[]
}

export default function PostsClient({ posts }: PostsClientProps) {
  const [loadedCount, setLoadedCount] = useState(POSTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)

  // 始终使用相同的逻辑，避免 hydration 不匹配
  const displayedPosts = posts.slice(0, loadedCount)
  const hasMore = loadedCount < posts.length

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + POSTS_PER_PAGE, posts.length))
      setIsLoading(false)
    }, 300)
  }, [isLoading, hasMore, posts.length])

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, offsetHeight } = document.documentElement
      if (window.innerHeight + scrollTop >= offsetHeight - SCROLL_THRESHOLD) {
        loadMore()
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4 mx-4 md:mx-8 my-8">
        {displayedPosts.map((post, index) => (
          <PostCardSmall 
            key={post.slug} 
            post={post}
          />
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted">
            <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      )}

      {!hasMore && displayedPosts.length > 0 && (
        <div className="text-center py-8 text-sm text-muted">已显示全部文章</div>
      )}
    </>
  )
}
