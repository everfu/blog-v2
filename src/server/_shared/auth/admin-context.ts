import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'

export async function requireAdminAction() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/login')
  return admin
}

