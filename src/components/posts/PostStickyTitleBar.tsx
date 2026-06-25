'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PostStickyTitleBarProps {
  title: string
  backHref: string
}

interface StickyTitleState {
  visible: boolean
  progress: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function PostStickyTitleBar({ title, backHref }: PostStickyTitleBarProps) {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<StickyTitleState>({
    visible: false,
    progress: 0,
  })

  const update = useCallback(() => {
    const header = document.getElementById('article-header')
    const content = document.getElementById('article-content')

    if (!header || !content) return

    const scrollY = window.scrollY || document.documentElement.scrollTop
    const headerBottom = header.offsetTop + header.offsetHeight
    const contentStart = content.offsetTop
    const contentEnd = content.offsetTop + content.offsetHeight - window.innerHeight
    const readableDistance = Math.max(1, contentEnd - contentStart)
    const progress = clamp((scrollY - contentStart) / readableDistance, 0, 1)

    setState(current => {
      const next = {
        visible: scrollY > headerBottom,
        progress,
      }

      if (
        current.visible === next.visible &&
        Math.abs(current.progress - next.progress) < 0.002
      ) {
        return current
      }

      return next
    })
  }, [])

  useEffect(() => {
    let frame = 0

    setMounted(true)

    function requestUpdate() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [update])

  const bar = (
    <div
      className={`post-sticky-title-bar ${state.visible ? 'is-visible' : ''}`}
      aria-hidden={!state.visible}
    >
      <div className="post-sticky-title-inner">
        <Link
          href={backHref}
          className="post-sticky-title-back"
          aria-label="返回文章列表"
          tabIndex={state.visible ? 0 : -1}
        >
          <span className="i-lucide-arrow-left" aria-hidden />
        </Link>
        <div className="post-sticky-title-text" title={title}>
          {title}
        </div>
      </div>
      <div className="post-sticky-title-progress" aria-hidden>
        <span style={{ transform: `scaleX(${state.progress})` }} />
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(bar, document.body)
}
