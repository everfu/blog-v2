'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CopyPathButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copyPath() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={copyPath}
      className="shrink-0 text-muted-foreground hover:text-foreground"
      aria-label={copied ? '已复制' : '复制路径'}
    >
      <span className={`${copied ? 'i-lucide-check' : 'i-lucide-copy'} text-xs`} />
    </Button>
  )
}
