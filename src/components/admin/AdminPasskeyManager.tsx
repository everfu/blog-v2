'use client'

import { useEffect, useState } from 'react'
import {
  FingerprintIcon,
  KeyRoundIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PasskeyItem = {
  id: string
  friendly_name?: string
  created_at: string
  last_used_at?: string
}

function formatDate(value?: string) {
  if (!value) return '从未使用'

  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getPasskeyErrorMessage(error: unknown) {
  if (!error || typeof error !== 'object') return '通行密钥操作失败。'

  const record = error as { code?: string, message?: string, name?: string }
  const message = record.message || ''

  if (record.code === 'passkey_disabled') {
    return 'Supabase 尚未启用通行密钥，请检查 Authentication → Passkeys 配置。'
  }

  if (record.code === 'too_many_passkeys') {
    return '当前账号已达到通行密钥数量上限。'
  }

  if (record.code === 'webauthn_credential_exists') {
    return '这个认证器已经注册过通行密钥。'
  }

  if (
    record.name === 'NotAllowedError' ||
    message.toLowerCase().includes('notallowed') ||
    message.toLowerCase().includes('cancel')
  ) {
    return '通行密钥操作已取消。'
  }

  if (message) return message

  return '通行密钥操作失败。'
}

export default function AdminPasskeyManager() {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [friendlyName, setFriendlyName] = useState('')

  async function loadPasskeys() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.auth.passkey.list()

    if (error) {
      setError(getPasskeyErrorMessage(error))
      setPasskeys([])
    } else {
      setPasskeys(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadPasskeys()
  }, [])

  async function registerPasskey() {
    setBusy('register')
    setError(null)
    setNotice(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.registerPasskey()

      if (error) {
        setError(getPasskeyErrorMessage(error))
        return
      }

      setNotice('通行密钥已注册。')
      await loadPasskeys()
    } catch (error) {
      setError(getPasskeyErrorMessage(error))
    } finally {
      setBusy(null)
    }
  }

  function startEditing(passkey: PasskeyItem) {
    setEditingId(passkey.id)
    setFriendlyName(passkey.friendly_name || '')
    setError(null)
    setNotice(null)
  }

  async function saveFriendlyName(passkeyId: string) {
    const name = friendlyName.trim()

    if (!name) {
      setError('名称不能为空。')
      return
    }

    if (name.length > 120) {
      setError('名称不能超过 120 个字符。')
      return
    }

    setBusy(passkeyId)
    setError(null)
    setNotice(null)

    const supabase = createClient()
    const { error } = await supabase.auth.passkey.update({
      passkeyId,
      friendlyName: name,
    })

    if (error) {
      setError(getPasskeyErrorMessage(error))
    } else {
      setEditingId(null)
      setFriendlyName('')
      setNotice('通行密钥名称已更新。')
      await loadPasskeys()
    }

    setBusy(null)
  }

  async function deletePasskey(passkeyId: string) {
    if (passkeys.length <= 1) {
      setError('不能删除最后一个通行密钥，否则当前账号将无法登录。')
      return
    }

    setBusy(passkeyId)
    setError(null)
    setNotice(null)

    const supabase = createClient()
    const { error } = await supabase.auth.passkey.delete({ passkeyId })

    if (error) {
      setError(getPasskeyErrorMessage(error))
    } else {
      setNotice('通行密钥已删除。')
      await loadPasskeys()
    }

    setBusy(null)
  }

  return (
    <div className="divide-y divide-[var(--admin-border)]">
      <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FingerprintIcon className="h-4 w-4 text-muted" />
            通行密钥
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            为当前管理员账号注册和管理 WebAuthn 通行密钥。
          </p>
        </div>
        <Button
          type="button"
          onClick={registerPasskey}
          disabled={busy === 'register'}
          className="h-9 shrink-0"
        >
          {busy === 'register' ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
          注册通行密钥
        </Button>
      </div>

      {(error || notice) && (
        <div className="px-4 py-3 md:px-5">
          {error && (
            <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm leading-relaxed text-red-500">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm leading-relaxed text-emerald-600 dark:text-emerald-400">
              {notice}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-4 md:px-5">
        {loading ? (
          <div className="flex min-h-32 items-center justify-center text-sm text-muted">
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            正在读取通行密钥
          </div>
        ) : passkeys.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed border-[var(--admin-border)] bg-background px-4 py-6 text-center">
            <KeyRoundIcon className="mb-3 h-5 w-5 text-muted" />
            <div className="text-sm font-medium text-foreground">尚未注册通行密钥</div>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted">
              注册后即可在登录页直接使用通行密钥进入后台。
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {passkeys.map(passkey => {
              const isEditing = editingId === passkey.id
              const isBusy = busy === passkey.id

              return (
                <div key={passkey.id} className="rounded-md border border-[var(--admin-border)] bg-background p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      {isEditing ? (
                        <Input
                          value={friendlyName}
                          onChange={event => setFriendlyName(event.target.value)}
                          className="h-9 max-w-md"
                          maxLength={120}
                          autoFocus
                        />
                      ) : (
                        <div className="truncate text-sm font-medium text-foreground">
                          {passkey.friendly_name || '未命名通行密钥'}
                        </div>
                      )}
                      <div className="mt-1 grid gap-1 text-xs text-muted sm:grid-cols-2">
                        <span>创建：{formatDate(passkey.created_at)}</span>
                        <span>最近使用：{formatDate(passkey.last_used_at)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button type="button" size="sm" onClick={() => saveFriendlyName(passkey.id)} disabled={isBusy}>
                            {isBusy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : null}
                            保存
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={isBusy}>
                            取消
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" variant="outline" size="icon-sm" onClick={() => startEditing(passkey)} aria-label="重命名通行密钥">
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => deletePasskey(passkey.id)}
                            disabled={isBusy || passkeys.length <= 1}
                            aria-label="删除通行密钥"
                            title={passkeys.length <= 1 ? '不能删除最后一个通行密钥' : '删除通行密钥'}
                          >
                            {isBusy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <Trash2Icon className="h-3.5 w-3.5" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
