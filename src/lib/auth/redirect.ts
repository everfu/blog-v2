export function getAdminRedirectPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== 'string') return '/admin'

  const path = value.trim()

  if (path === '/admin' || path.startsWith('/admin/')) {
    return path
  }

  return '/admin'
}
