'use client'

import { FormEvent, useState } from 'react'
import { siteConfig } from '@/config/site'

interface FriendApplicationFormState {
  authorName: string
  siteName: string
  description: string
  siteUrl: string
  avatarUrl: string
  feedUrl: string
}

const emptyForm: FriendApplicationFormState = {
  authorName: '',
  siteName: '',
  description: '',
  siteUrl: '',
  avatarUrl: '',
  feedUrl: '',
}

const siteUrl = siteConfig.url.replace(/\/$/, '')
const avatarUrl = siteConfig.assets.avatar.startsWith('http')
  ? siteConfig.assets.avatar
  : `${siteUrl}${siteConfig.assets.avatar}`

const fields: Array<{
  name: keyof FriendApplicationFormState
  label: string
  placeholder: string
  required?: boolean
  type?: string
}> = [
  { name: 'authorName', label: '博主', placeholder: siteConfig.author.name, required: true },
  { name: 'siteName', label: '标题', placeholder: siteConfig.title, required: true },
  { name: 'description', label: '介绍', placeholder: siteConfig.description, required: true },
  { name: 'siteUrl', label: '网址', placeholder: siteUrl, required: true, type: 'url' },
  { name: 'avatarUrl', label: '头像', placeholder: avatarUrl, type: 'url' },
  { name: 'feedUrl', label: 'Feed', placeholder: `${siteUrl}/atom.xml`, type: 'url' },
]

export default function FriendApplicationForm() {
  const [form, setForm] = useState<FriendApplicationFormState>(emptyForm)
  const [activeTab, setActiveTab] = useState<'application' | 'rules'>('application')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name: keyof FriendApplicationFormState, value: string) {
    setForm(current => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/friend-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(form),
      })
      const data = await response.json().catch(() => ({})) as { message?: string }

      if (!response.ok) {
        setStatus('error')
        setMessage(data.message || '友链申请提交失败。')
        return
      }

      setStatus('success')
      setMessage(data.message || '申请已提交，审核后会处理。')
      setForm(emptyForm)
    } catch {
      setStatus('error')
      setMessage('友链申请提交失败，请稍后再试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-4 my-8 md:mx-8">
      <div className="mx-auto max-w-[460px]">
        <div className="mb-5 flex justify-center">
          <div className="flex w-full max-w-[250px] items-end justify-center gap-5 border-b border-border text-sm font-semibold" role="tablist" aria-label="友链申请">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'application'}
              onClick={() => setActiveTab('application')}
              className={`border-b-2 px-2 pb-2 pt-1 transition-colors ${
                activeTab === 'application' ? 'border-foreground text-foreground' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              申请友链
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'rules'}
              onClick={() => setActiveTab('rules')}
              className={`border-b-2 px-2 pb-2 pt-1 transition-colors ${
                activeTab === 'rules' ? 'border-foreground text-foreground' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              友链事项
            </button>
          </div>
        </div>

        {activeTab === 'application' ? (
          <form onSubmit={handleSubmit} className="grid gap-2.5" role="tabpanel">
            {fields.map(field => (
              <label
                key={field.name}
                className="card grid min-h-10 grid-cols-[68px_minmax(0,1fr)] overflow-hidden focus-within:border-primary"
              >
                <span className="flex items-center border-r border-border bg-background px-3 text-sm font-semibold text-muted">
                  {field.label}
                </span>
                <input
                  value={form[field.name]}
                  onChange={event => updateField(field.name, event.target.value)}
                  required={field.required}
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  disabled={isSubmitting}
                  className="min-w-0 bg-transparent px-3 text-sm font-semibold text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>
            ))}

            <div className="mt-1.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div
                aria-live="polite"
                className={`min-h-5 text-xs ${
                  status === 'success' ? 'text-emerald-500' : status === 'error' ? 'text-red-400' : 'text-muted'
                }`}
              >
                {message}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-8 items-center justify-center gap-2 border border-foreground bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className={isSubmitting ? 'i-lucide-loader-2 h-3.5 w-3.5 animate-spin' : 'i-lucide-send h-3.5 w-3.5'} />
                {isSubmitting ? '提交中' : '提交申请'}
              </button>
            </div>
          </form>
        ) : (
          <div className="card px-4 py-4" role="tabpanel">
            <ul className="grid gap-2.5 text-sm leading-relaxed text-foreground">
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>原则上与多数独立博客的友链要求一致。</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full border border-primary" />
                <span>能够长期更新维护，并输出有价值的原创内容。</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full border border-primary" />
                <span>
                  可以参考{' '}
                  <a href="https://www.travellings.cn/docs/join.html" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-muted">
                    加入开往
                  </a>
                  {' '}页面的规则。
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full border border-primary" />
                <span>信息可能会被适当修改，以保证展示效果。</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
