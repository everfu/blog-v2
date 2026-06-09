'use client'

import Script from 'next/script'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'

declare global {
  interface Window {
    twikoo?: {
      init: (config: { el: string; envId: string; path?: string }) => void | Promise<void>
    }
  }
}

interface CommentProps {
  path?: string
  title?: string
  className?: string
}

export default function Comment({
  path,
  title = 'Comments',
  className = '',
}: CommentProps) {
  const initialized = useRef(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const pathname = usePathname()
  const reactId = useId()
  const commentConfig = siteConfig.comment

  const containerId = useMemo(
    () => `tcomment-${reactId.replace(/:/g, '')}`,
    [reactId]
  )
  const commentPath = path || pathname || '/'

  const initComment = useCallback(() => {
    if (initialized.current || !window.twikoo) return

    const container = document.getElementById(containerId)
    if (!container) return

    initialized.current = true
    setStatus('loading')
    container.innerHTML = ''

    Promise.resolve(
      window.twikoo.init({
        el: `#${containerId}`,
        envId: commentConfig.envId,
        path: commentPath,
      })
    )
      .then(() => {
        setStatus('ready')
      })
      .catch(() => {
        initialized.current = false
        setStatus('error')
      })
  }, [commentConfig.envId, commentPath, containerId])

  useEffect(() => {
    initComment()
  }, [initComment])

  return (
    <section className={`comment-section mx-4 my-8 md:mx-8 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider text-muted">
          {title}
        </h2>
        {status === 'loading' && (
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <span className="h-3 w-3 animate-spin rounded-full border border-muted border-t-foreground" />
            Loading
          </span>
        )}
      </div>

      {status === 'error' && (
        <div className="mb-4 border-l border-border pl-4 text-xs leading-relaxed text-muted">
          评论区暂时加载失败，请稍后刷新页面再试。
        </div>
      )}

      <div
        id={containerId}
        className={status === 'ready' ? 'comment-container is-ready' : 'comment-container'}
      />
      <Script
        src={commentConfig.scriptSrc}
        strategy="lazyOnload"
        onLoad={initComment}
        onReady={initComment}
        onError={() => {
          initialized.current = false
          setStatus('error')
        }}
      />
    </section>
  )
}
