'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'
import { siteConfig } from '@/config/site'

declare global {
  interface Window {
    twikoo?: {
      init: (config: { el: string; envId: string }) => void
    }
  }
}

export default function Comment() {
  const initialized = useRef(false)
  const commentConfig = siteConfig.comment

  const initComment = () => {
    if (initialized.current || !window.twikoo) return

    const container = document.getElementById('tcomment')
    if (!container) return

    container.innerHTML = ''
    window.twikoo.init({
      el: '#tcomment',
      envId: commentConfig.envId,
    })
    initialized.current = true
  }

  useEffect(() => {
    initComment()
  })

  return (
    <div className="px-4 pb-4">
      <div id="tcomment" />
      <Script
        src={commentConfig.scriptSrc}
        strategy="lazyOnload"
        onLoad={initComment}
      />
    </div>
  )
}
