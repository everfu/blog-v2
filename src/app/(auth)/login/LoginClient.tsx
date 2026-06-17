'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FingerprintIcon, Loader2Icon } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'

function getPasskeyErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return '通行密钥登录失败，请稍后再试。'

  const record = error as { code?: string, message?: string, name?: string, status?: number }
  const message = record.message || ''

  if (record.code === 'passkey_disabled') {
    return 'Supabase 尚未启用通行密钥登录，请检查 Authentication → Passkeys 配置。'
  }

  if (record.code === 'webauthn_credential_not_found') {
    return '没有找到可用于本站的通行密钥，请先使用迁移入口登录并注册通行密钥。'
  }

  if (record.code === 'email_not_confirmed' || record.code === 'phone_not_confirmed') {
    return '账号尚未完成确认，确认后才能使用通行密钥登录。'
  }

  if (record.code === 'user_banned') {
    return '当前账号已被禁用。'
  }

  if (
    record.name === 'NotAllowedError' ||
    message.toLowerCase().includes('notallowed') ||
    message.toLowerCase().includes('cancel')
  ) {
    return '通行密钥操作已取消。'
  }

  if (message) return message

  return '通行密钥登录失败，请稍后再试。'
}

async function syncProfile() {
  const response = await fetch('/auth/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })

  if (response.ok) return

  const payload = await response.json().catch(() => null) as { error?: string } | null

  if (payload?.error === 'profile-config') {
    throw new Error('缺少 Supabase service role key，无法同步管理员 profile。')
  }

  throw new Error('登录成功，但同步管理员资料失败。')
}

export default function LoginClient({
  nextPath,
  serverError,
}: {
  nextPath: string
  serverError: string | null
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const errorMessage = clientError || serverError
  const passkeySupported = useMemo(() => {
    if (typeof window === 'undefined') return true
    return Boolean(window.PublicKeyCredential && navigator.credentials)
  }, [])

  async function handlePasskeySignIn() {
    if (!passkeySupported) {
      setClientError('当前浏览器不支持 WebAuthn 通行密钥。')
      return
    }

    setPending(true)
    setClientError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPasskey()

      if (error) {
        setClientError(getPasskeyErrorMessage(error))
        return
      }

      await syncProfile()
      router.replace(nextPath)
      router.refresh()
    } catch (error) {
      setClientError(getPasskeyErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background text-foreground">
          <FingerprintIcon className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">管理员登录</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">使用通行密钥验证身份</p>
      </div>

      {errorMessage && (
        <div role="alert" className="mb-5 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-500">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <span className="i-lucide-circle-alert text-base" />
            登录失败
          </div>
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={handlePasskeySignIn}
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-foreground bg-foreground px-4 text-sm font-medium text-background shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <FingerprintIcon className="h-4 w-4" />}
        使用通行密钥登录
      </button>
    </div>
  )
}
