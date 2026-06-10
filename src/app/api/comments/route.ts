import { NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import { getCommentsByPath } from '@/features/comments'

export const dynamic = 'force-dynamic'

const commentSchema = z.object({
  pagePath: z.string().min(1).max(240).regex(/^\//),
  postId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  authorName: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  website: z.string().trim().url().max(240).optional().or(z.literal('')),
  body: z.string().trim().min(2).max(2000),
})

function hash(value: string) {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex')
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function GET(request: NextRequest) {
  const pagePath = request.nextUrl.searchParams.get('path')

  if (!pagePath || !pagePath.startsWith('/')) {
    return Response.json({ comments: [] }, { status: 400 })
  }

  const comments = await getCommentsByPath(pagePath)
  return Response.json({ comments })
}

export async function POST(request: NextRequest) {
  if (!isSupabaseAdminConfigured) {
    return Response.json({ message: 'Comments are not configured.' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ message: '评论内容格式不正确。' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const ipHash = hash(getClientIp(request))
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', tenMinutesAgo)

  if ((count || 0) >= 5) {
    return Response.json({ message: '评论太快了，稍后再试。' }, { status: 429 })
  }

  const website = parsed.data.website || null
  const emailHash = parsed.data.email ? hash(parsed.data.email) : null

  const { data, error } = await supabase
    .from('comments')
    .insert({
      page_path: parsed.data.pagePath,
      post_id: parsed.data.postId || null,
      parent_id: parsed.data.parentId || null,
      author_name: parsed.data.authorName,
      email_hash: emailHash,
      website,
      body: parsed.data.body,
      status: 'approved',
      ip_hash: ipHash,
      user_agent: request.headers.get('user-agent'),
    })
    .select('id,page_path,parent_id,author_name,email_hash,website,body,status,created_at')
    .single()

  if (error) {
    return Response.json({ message: '评论提交失败。' }, { status: 500 })
  }

  return Response.json({
    comment: {
      id: data.id,
      pagePath: data.page_path,
      parentId: data.parent_id,
      authorName: data.author_name,
      emailHash: data.email_hash,
      website: data.website,
      body: data.body,
      createdAt: data.created_at,
    },
  }, { status: 201 })
}
