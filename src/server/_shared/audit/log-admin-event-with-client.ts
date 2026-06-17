import type { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { Json } from '@/types/supabase'

export async function logAdminEventWithClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admin: CurrentAdmin,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Json = {}
) {
  await supabase.from('admin_audit_logs').insert({
    actor_id: admin.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  })
}

