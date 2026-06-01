'use client'

import { useEffect, useState } from 'react'
import { RoomProvider, useOthers, useSelf } from '@/lib/liveblocks'

function OnlineCounter() {
  const others = useOthers()
  const self = useSelf()
  
  // 当前在线人数 = 其他人 + 自己（如果已连接）
  const count = others.length + (self ? 1 : 0)

  if (count === 0) return null

  return (
    <span className="text-xs text-muted flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      {count} online
    </span>
  )
}

export default function OnlineCount() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <span className="text-xs text-muted flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-muted" />
        </span>
        - 人在线
      </span>
    )
  }

  return (
    <RoomProvider id="blog-visitors" initialPresence={{}}>
      <OnlineCounter />
    </RoomProvider>
  )
}
