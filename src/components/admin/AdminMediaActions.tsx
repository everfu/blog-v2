'use client'

import { useState } from 'react'
import { deleteMedia } from '@/app/admin/actions'
import type { AdminMediaAsset } from '@/server/media/adapters/page'
import { Button } from '@/components/ui/button'

export function AdminCopyMediaButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      }}
    >
      <span className={copied ? 'i-lucide-check text-sm' : 'i-lucide-copy text-sm'} />
      {copied ? '已复制' : '复制链接'}
    </Button>
  )
}

export function AdminDeleteMediaForm({
  asset,
  folder,
}: {
  asset: AdminMediaAsset
  folder: string
}) {
  return (
    <form
      action={deleteMedia}
      onSubmit={event => {
        if (!window.confirm(`删除 ${asset.name}？已有内容引用不会自动更新。`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="path" value={asset.path} />
      <input type="hidden" name="folder" value={folder} />
      <Button type="submit" variant="destructive" size="sm">
        <span className="i-lucide-trash-2 text-sm" />
        删除
      </Button>
    </form>
  )
}

