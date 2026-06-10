import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { getAdminRedirectPath } from '@/lib/auth/redirect'

export async function requireAdminPage(nextPath: string) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    const next = encodeURIComponent(getAdminRedirectPath(nextPath))
    redirect(`/login?next=${next}`)
  }

  return admin
}
