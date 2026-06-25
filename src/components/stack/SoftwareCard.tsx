'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { SoftwareItem } from '@/types'
import { cn } from '@/lib/utils'

interface SoftwareCardProps {
  item: SoftwareItem
}

function IconFallback() {
  return <span className="i-lucide-package text-xl text-muted opacity-30" aria-hidden="true" />
}

function SkillIcon({ name }: { name: string }) {
  const [lightFailed, setLightFailed] = useState(false)
  const [darkFailed, setDarkFailed] = useState(false)
  const skillIconName = name.trim().toLowerCase()
  const iconName = encodeURIComponent(skillIconName)

  if (!skillIconName || skillIconName.startsWith('i-')) return <IconFallback />

  return (
    <>
      <span className="skill-icon-light inline-flex h-6 w-6 items-center justify-center">
        {lightFailed ? (
          <IconFallback />
        ) : (
          <Image
            src={`https://skillicons.dev/icons?i=${iconName}&theme=light`}
            alt=""
            width={24}
            height={24}
            unoptimized
            onError={() => setLightFailed(true)}
            className="h-6 w-6"
          />
        )}
      </span>
      <span className="skill-icon-dark h-6 w-6 items-center justify-center">
        {darkFailed ? (
          <IconFallback />
        ) : (
          <Image
            src={`https://skillicons.dev/icons?i=${iconName}&theme=dark`}
            alt=""
            width={24}
            height={24}
            unoptimized
            onError={() => setDarkFailed(true)}
            className="h-6 w-6"
          />
        )}
      </span>
    </>
  )
}

function ItemIcon({ icon, image, name }: Pick<SoftwareItem, 'icon' | 'image' | 'name'>) {
  if (icon) return <SkillIcon name={icon} />
  if (image) return <Image src={image} alt={name} fill sizes="40px" className="object-cover rounded" />
  return <IconFallback />
}

export default function SoftwareCard({ item }: SoftwareCardProps) {
  const isLinked = Boolean(item.url)

  const content = (
    <div
      className={cn(
        'card flex items-start gap-3 p-3',
        isLinked && 'group-hover:border-primary group-focus-visible:border-primary',
      )}
    >
      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
        <ItemIcon icon={item.icon} image={item.image} name={item.name} />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="mb-0.5 flex items-center gap-2 text-sm font-medium transition-opacity group-hover:opacity-70 group-focus-visible:opacity-70">
          {item.name}
          {item.recommended && (
            <span className="px-1.5 py-0.5 text-xs font-medium text-red-500">推荐</span>
          )}
        </h4>
        {item.description && (
          <p className="text-xs leading-relaxed text-muted">{item.description}</p>
        )}
      </div>
    </div>
  )

  return item.url ? (
    <Link
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`访问 ${item.name} 官网（新窗口打开）`}
      className="group block outline-none focus-visible:outline-none"
    >
      {content}
    </Link>
  ) : content
}
