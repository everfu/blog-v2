'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CurrentAdmin } from '@/lib/auth/admin'
import { profileRoles } from './admin'
import { logAdminEvent } from '@/server/_shared/audit/log-admin-event'

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(profileRoles),
})

export async function updateAdminUserRole(admin: CurrentAdmin, formData: FormData) {
  const parsed = roleSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    redirect('/admin/users?error=invalid-user')
  }

  const supabase = createAdminClient()
  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', parsed.data.id)
    .maybeSingle()

  if (existingError) {
    redirect('/admin/users?error=load')
  }

  const oldRole = existing?.role ?? 'user'

  if (oldRole === parsed.data.role) {
    redirect('/admin/users')
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: parsed.data.id, role: parsed.data.role }, { onConflict: 'id' })

  if (error) {
    redirect('/admin/users?error=save')
  }

  await logAdminEvent(admin, {
    action: 'update_role',
    entityType: 'profile',
    entityId: parsed.data.id,
    metadata: { oldRole, newRole: parsed.data.role },
  })

  revalidatePath('/admin/users')
  redirect('/admin/users?updated=1')
}
