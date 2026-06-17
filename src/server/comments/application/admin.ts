import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { CommentStatus } from '@/types/supabase'
import { mapAdminComment } from '../data/mapper'
import type { AdminComment, AdminCommentFilters, AdminCommentRow, AdminCommentSummary } from '../contracts/types'

const statusOrder: Record<CommentStatus, number> = {
  pending: 0,
  approved: 1,
  spam: 2,
  deleted: 3,
}

function sanitizeSearchValue(value: string) {
  return value.replace(/[%_,]/g, ' ').trim()
}

function sanitizeDateValue(value?: string) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString()
}

function applyCommentOrdering(
  query: ReturnType<Awaited<ReturnType<typeof createClient>>['from']>,
  sort: AdminCommentFilters['sort']
) {
  if (sort === 'oldest') return query.order('created_at', { ascending: true })
  if (sort === 'likes') return query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
  return query.order('created_at', { ascending: false })
}

export async function getAdminComments(filters: AdminCommentFilters = {}): Promise<AdminComment[]> {
  if (!isSupabaseConfigured) return []

  const supabase = await createClient()
  let query = supabase
    .from('comments')
    .select('id,page_path,post_id,parent_id,author_name,author_email,email_hash,website,body,status,auth_mode,location_label,ua_browser,ua_browser_version,ua_os,ua_device,ua_request_id,like_count,viewer_token_hash,user_agent,ip_hash,notified_owner_at,notified_reply_at,created_at')

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters.pagePath?.trim()) {
    query = query.ilike('page_path', `%${sanitizeSearchValue(filters.pagePath)}%`)
  }

  if (filters.keyword?.trim()) {
    const keyword = sanitizeSearchValue(filters.keyword)
    const clauses = [
      `author_name.ilike.%${keyword}%`,
      `author_email.ilike.%${keyword}%`,
      `website.ilike.%${keyword}%`,
      `body.ilike.%${keyword}%`,
      `page_path.ilike.%${keyword}%`,
      `location_label.ilike.%${keyword}%`,
      `ua_browser.ilike.%${keyword}%`,
      `ua_os.ilike.%${keyword}%`,
      `ua_device.ilike.%${keyword}%`,
    ]
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(keyword)) {
      clauses.unshift(`id.eq.${keyword}`)
    }
    query = query.or(clauses.join(','))
  }

  const createdFrom = sanitizeDateValue(filters.createdFrom)
  const createdTo = sanitizeDateValue(filters.createdTo)
  if (createdFrom) query = query.gte('created_at', createdFrom)
  if (createdTo) query = query.lte('created_at', createdTo)

  query = applyCommentOrdering(query, filters.sort)

  const { data, error } = await query
  if (error || !data) return []

  return (data as unknown as AdminCommentRow[])
    .map(mapAdminComment)
    .sort((a, b) => {
      if (filters.sort === 'oldest' || filters.sort === 'likes') return 0
      return statusOrder[a.status] - statusOrder[b.status]
    })
}

export async function getCommentCountByStatus() {
  const comments = await getAdminComments()

  return comments.reduce<Record<CommentStatus, number>>(
    (counts, comment) => {
      counts[comment.status] += 1
      return counts
    },
    { pending: 0, approved: 0, spam: 0, deleted: 0 }
  )
}

export async function getAdminCommentSummary(filters: AdminCommentFilters = {}): Promise<AdminCommentSummary> {
  if (!isSupabaseConfigured) {
    return {
      total: 0,
      pending: 0,
      approved: 0,
      spam: 0,
      deleted: 0,
      filtered: 0,
    }
  }

  const supabase = await createClient()
  const [{ data }, filteredComments] = await Promise.all([
    supabase.from('comments').select('status'),
    getAdminComments(filters),
  ])

  const rows = data || []
  const summary = rows.reduce<AdminCommentSummary>(
    (counts, comment) => {
      counts.total += 1
      counts[comment.status as CommentStatus] += 1
      return counts
    },
    { total: 0, pending: 0, approved: 0, spam: 0, deleted: 0, filtered: filteredComments.length }
  )

  summary.filtered = filteredComments.length
  return summary
}
