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

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const tocHeadings = useMemo(
    () => headings.filter(heading => heading.level === 2 || heading.level === 3),
    [headings],
  )
  const [activeId, setActiveId] = useState<string>('')
  const [track, setTrack] = useState<TocTrack | null>(null)
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

  if (tocHeadings.length === 0) return null

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
    </nav>
  )
}
