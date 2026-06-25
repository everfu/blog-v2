'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { TocHeading } from '@/lib/extractHeadings'

export interface TableOfContentsProps {
  headings: TocHeading[]
}

interface TocTrack {
  d: string
  width: number
  height: number
  points: Record<string, { x: number; y: number }>
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const tocHeadings = useMemo(
    () => headings.filter(heading => heading.level === 2 || heading.level === 3),
    [headings],
  )
  const [activeId, setActiveId] = useState<string>('')
  const [track, setTrack] = useState<TocTrack | null>(null)
  const [progress, setProgress] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)

  const measureTrack = useCallback(() => {
    const list = listRef.current
    if (!list || tocHeadings.length === 0) {
      setTrack(null)
      return
    }

    const anchors = Array.from(list.querySelectorAll<HTMLAnchorElement>('.article-toc-link'))
    if (anchors.length === 0) {
      setTrack(null)
      return
    }

    let d = ''
    let height = 0
    const points: TocTrack['points'] = {}
    const positions: Array<{ top: number; bottom: number; x: number }> = []

    anchors.forEach((anchor, index) => {
      const heading = tocHeadings[index]
      if (!heading) return

      const styles = getComputedStyle(anchor)
      const top = anchor.offsetTop + parseFloat(styles.paddingTop)
      const bottom = anchor.offsetTop + anchor.clientHeight - parseFloat(styles.paddingBottom)
      const x = heading.level === 2 ? 8 : 22
      const y = (top + bottom) / 2
      const previous = positions[index - 1]

      if (!previous) {
        d += `M${x} ${top} L${x} ${bottom}`
      } else {
        d += ` C ${previous.x} ${top - 6} ${x} ${previous.bottom + 6} ${x} ${top} L${x} ${bottom}`
      }

      points[heading.id] = { x, y }
      positions.push({ top, bottom, x })
      height = Math.max(height, bottom)
    })

    setTrack({
      d,
      width: 32,
      height,
      points,
    })
  }, [tocHeadings])

  useEffect(() => {
    if (tocHeadings.length === 0) return
    setActiveId(current => current || tocHeadings[0].id)
    const elements = tocHeadings
      .map(h => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    observerRef.current = new IntersectionObserver(
      entries => {
        // 取最靠近顶部且处于视口内的标题作为 active
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      },
    )
    elements.forEach(el => observerRef.current?.observe(el))
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [tocHeadings])

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const frame = window.requestAnimationFrame(measureTrack)
    const observer = new ResizeObserver(measureTrack)
    observer.observe(list)
    window.addEventListener('resize', measureTrack)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measureTrack)
    }
  }, [measureTrack])

  const updateProgress = useCallback(() => {
    const content = document.getElementById('article-content')
    if (!content) return

    const scrollY = window.scrollY || document.documentElement.scrollTop
    const contentStart = content.offsetTop
    const contentEnd = content.offsetTop + content.offsetHeight - window.innerHeight
    const readableDistance = Math.max(1, contentEnd - contentStart)
    const next = clamp((scrollY - contentStart) / readableDistance, 0, 1)

    setProgress(current => (Math.abs(current - next) < 0.002 ? current : next))
  }, [])

  useEffect(() => {
    let frame = 0

    function requestUpdate() {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateProgress()
      })
    }

    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [updateProgress])

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault()
      const el = document.getElementById(id)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth' })
      window.history.replaceState(null, '', `#${id}`)
      setActiveId(id)
    },
    [],
  )

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (tocHeadings.length === 0) return null

  const progressPercent = Math.round(progress * 100)

  return (
    <nav
      aria-label="文章目录"
      className="article-toc"
    >
      <div className="article-toc-kicker">
        <span className="i-lucide-menu text-sm" aria-hidden />
        目录
      </div>
      <div className="article-toc-body">
        {track && (
          <svg
            className="article-toc-track"
            width={track.width}
            height={track.height}
            viewBox={`0 0 ${track.width} ${track.height}`}
            aria-hidden
          >
            <path className="article-toc-track-path" d={track.d} />
            {track.points[activeId] && (
              <circle
                className="article-toc-track-thumb"
                cx={track.points[activeId].x}
                cy={track.points[activeId].y}
                r="3"
              />
            )}
          </svg>
        )}
        <ul className="article-toc-list" ref={listRef}>
          {tocHeadings.map(heading => {
            const isActive = heading.id === activeId
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={e => onClick(e, heading.id)}
                  className={cn(
                    'article-toc-link',
                    heading.level === 2 ? 'is-level-2' : 'is-level-3',
                    isActive && 'is-active',
                  )}
                >
                  {heading.text}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      <button
        type="button"
        className="article-toc-progress-pill"
        onClick={scrollToTop}
        aria-label={`阅读进度 ${progressPercent}%，回到顶部`}
      >
        <span className="article-toc-progress-value">{progressPercent}%</span>
        <span className="article-toc-progress-top">
          <span className="i-lucide-arrow-up text-xs" aria-hidden />
          顶部
        </span>
      </button>
    </nav>
  )
}
