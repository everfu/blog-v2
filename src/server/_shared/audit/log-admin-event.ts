import { createClient } from '@/lib/supabase/server'
import type { CurrentAdmin } from '@/lib/auth/admin'
import type { Json } from '@/types/supabase'

export interface AdminAuditEvent {
  action: string
  entityType: string
  entityId: string | null
  metadata?: Json
}

export async function logAdminEvent(admin: CurrentAdmin, event: AdminAuditEvent) {
  const supabase = await createClient()

  await supabase.from('admin_audit_logs').insert({
    actor_id: admin.id,
    action: event.action,
    entity_type: event.entityType,
    entity_id: event.entityId,
    metadata: event.metadata || {},
  })
}

