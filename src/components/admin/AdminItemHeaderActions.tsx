'use client'

import type { ReactNode } from 'react'

export function AdminItemHeaderActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-2" onClick={event => event.stopPropagation()}>
      {children}
    </div>
  )
}
