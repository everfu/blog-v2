import { emptyCommentForm } from './constants'
import type { CommentFormState } from './types'

function createViewerToken() {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function getViewerToken() {
  const key = 'cube-comment-viewer-token'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const token = createViewerToken()
  window.localStorage.setItem(key, token)
  return token
}

export function getStoredIdentity() {
  try {
    const raw = window.localStorage.getItem('cube-comment-identity')
    if (!raw) return emptyCommentForm
    const parsed = JSON.parse(raw) as Partial<CommentFormState>
    return {
      authorName: parsed.authorName || '',
      email: parsed.email || '',
      website: parsed.website || '',
      body: '',
    }
  } catch {
    return emptyCommentForm
  }
}

export function storeIdentity(form: CommentFormState) {
  window.localStorage.setItem('cube-comment-identity', JSON.stringify({
    authorName: form.authorName,
    email: form.email,
    website: form.website,
  }))
}
