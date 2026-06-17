'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { updateCommentStatus, updateCommentStatuses } from '@/app/admin/actions'
import type { AdminComment } from '@/server/comments/contracts/types'
import type { CommentStatus } from '@/types/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AdminEmptyState, AdminPanel, StatusBadge, getCommentStatusLabel, getStatusTone } from './AdminPrimitives'

interface AdminCommentsListProps {
  comments: AdminComment[]
  emptyBody?: string
}

const actionLabels: Record<CommentStatus, string> = {
  approved: '通过',
  pending: '待审',
  spam: '垃圾',
  deleted: '删除',
}

const actionIcons: Record<CommentStatus, string> = {
  approved: 'i-lucide-circle-check',
  pending: 'i-lucide-clock-3',
  spam: 'i-lucide-ban',
  deleted: 'i-lucide-trash-2',
}

function useCurrentAdminCommentsPath() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  return `${pathname}${query ? `?${query}` : ''}`
}

function MarkdownPreview({ body }: { body: string }) {
  return (
    <div className="comment-markdown line-clamp-2 max-w-none text-[13px] leading-relaxed text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {body}
      </ReactMarkdown>
    </div>
  )
}

function getCommentAnchorHref(comment: AdminComment) {
  return `${comment.pagePath}#comment-${comment.id}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN')
}

function CommentStatusForm({
  comment,
  status,
  currentPath,
}: {
  comment: AdminComment
  status: CommentStatus
  currentPath: string
}) {
  const isPermanentDeleteAction = status === 'deleted' && comment.status === 'deleted'
  const label = isPermanentDeleteAction ? '永久删除' : actionLabels[status]

  return (
    <form action={updateCommentStatus}>
      <input type="hidden" name="id" value={comment.id} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="redirectTo" value={currentPath} />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={comment.status === status && !isPermanentDeleteAction}
        title={label}
        aria-label={label}
        className={cn(
          'h-7 w-7 text-muted hover:bg-[var(--admin-accent-soft)] hover:text-foreground',
          status === 'deleted' && 'text-red-500 hover:bg-red-500/10 hover:text-red-600'
        )}
      >
        <span className={`${actionIcons[status]} text-sm`} />
      </Button>
    </form>
  )
}

function BulkActions({
  selectedIds,
  total,
  currentPath,
  onToggleAll,
  allSelected,
}: {
  selectedIds: string[]
  total: number
  currentPath: string
  onToggleAll: () => void
  allSelected: boolean
}) {
  return (
    <AdminPanel className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="选择全部评论" />
          <span>已选择 {selectedIds.length} / {total} 条</span>
        </label>
        <form action={updateCommentStatuses} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="redirectTo" value={currentPath} />
          {selectedIds.map(id => <input key={id} type="hidden" name="ids" value={id} />)}
          {(['approved', 'spam', 'deleted'] as const).map(status => (
            <Button
              key={status}
              type="submit"
              name="status"
              value={status}
              disabled={selectedIds.length === 0}
              variant={status === 'deleted' ? 'destructive' : 'outline'}
              size="sm"
            >
              <span className={`${actionIcons[status]} text-sm`} />
              批量{actionLabels[status]}
            </Button>
          ))}
        </form>
      </div>
    </AdminPanel>
  )
}

export default function AdminCommentsList({ comments, emptyBody = '当前没有匹配的评论。' }: AdminCommentsListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const currentPath = useCurrentAdminCommentsPath()
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const allSelected = comments.length > 0 && selectedIds.length === comments.length

  function toggleAll() {
    setSelectedIds(allSelected ? [] : comments.map(comment => comment.id))
  }

  function toggleComment(id: string) {
    setSelectedIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  if (comments.length === 0) {
    return <AdminEmptyState title="暂无评论" body={emptyBody} />
  }

  return (
    <div className="space-y-3">
      <BulkActions
        selectedIds={selectedIds}
        total={comments.length}
        currentPath={currentPath}
        onToggleAll={toggleAll}
        allSelected={allSelected}
      />
      <AdminPanel className="overflow-hidden">
        <Table className="min-w-[1120px] table-fixed">
          <TableHeader className="bg-[var(--admin-surface-muted)] [&_tr]:border-[var(--admin-border)]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-11 px-3 text-[11px] font-medium uppercase text-muted"></TableHead>
              <TableHead className="w-[34%] px-3 text-[11px] font-medium uppercase text-muted">评论</TableHead>
              <TableHead className="w-[20%] px-3 text-[11px] font-medium uppercase text-muted">访客</TableHead>
              <TableHead className="w-[20%] px-3 text-[11px] font-medium uppercase text-muted">来源</TableHead>
              <TableHead className="w-24 px-3 text-[11px] font-medium uppercase text-muted">状态</TableHead>
              <TableHead className="w-36 px-3 text-[11px] font-medium uppercase text-muted">时间</TableHead>
              <TableHead className="w-36 px-3 text-right text-[11px] font-medium uppercase text-muted">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[var(--admin-border)] [&_tr:last-child]:border-b-0">
            {comments.map(comment => (
              <TableRow
                key={comment.id}
                className={cn(
                  'border-0 hover:bg-[var(--admin-accent-soft)]',
                  selectedSet.has(comment.id) && 'bg-[var(--admin-accent-soft)]',
                  comment.status === 'pending' && 'bg-amber-500/5'
                )}
              >
                <TableCell className="px-3 py-3 align-top">
                  <Checkbox
                    checked={selectedSet.has(comment.id)}
                    onCheckedChange={() => toggleComment(comment.id)}
                    aria-label={`选择 ${comment.authorName} 的评论`}
                    className="mt-1"
                  />
                </TableCell>
                <TableCell className="whitespace-normal px-3 py-3 align-top">
                  <div className="grid min-w-0 gap-1.5">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
                      <Link href={getCommentAnchorHref(comment)} target="_blank" rel="noreferrer" className="min-w-0 max-w-[260px] truncate hover:text-foreground hover:opacity-100">
                        {comment.pagePath}
                      </Link>
                      <span className="inline-flex shrink-0 items-center gap-1 text-muted">
                        <span className="i-lucide-heart text-xs" />
                        {comment.likeCount}
                      </span>
                    </div>
                    <MarkdownPreview body={comment.body} />
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal px-3 py-3 align-top">
                  <div className="grid min-w-0 gap-1 text-xs">
                    <div className="truncate font-medium text-foreground">{comment.authorName}</div>
                    <a href={`mailto:${comment.authorEmail || ''}`} className="truncate text-muted hover:text-foreground hover:opacity-100">{comment.authorEmail || '无邮箱'}</a>
                    {comment.website && (
                      <a href={comment.website} target="_blank" rel="noreferrer" className="truncate text-muted hover:text-foreground hover:opacity-100">
                        {comment.website}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal px-3 py-3 align-top">
                  <div className="grid min-w-0 gap-1 text-xs text-muted">
                    <span className="truncate">{comment.locationLabel || '未知地区'}</span>
                    <span className="truncate">{comment.uaSummary || '未知设备'}</span>
                    {comment.uaRequestId && <span className="truncate">UA ID: {comment.uaRequestId}</span>}
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 align-top">
                  <StatusBadge tone={getStatusTone(comment.status)}>{getCommentStatusLabel(comment.status)}</StatusBadge>
                </TableCell>
                <TableCell className="px-3 py-3 align-top text-xs text-muted">{formatDate(comment.createdAt)}</TableCell>
                <TableCell className="px-3 py-3 align-top">
                  <div className="flex justify-end">
                    <div className="inline-flex rounded-md border border-[var(--admin-border)] bg-background p-0.5">
                      {(['approved', 'pending', 'spam', 'deleted'] as const).map(status => (
                        <CommentStatusForm key={status} comment={comment} status={status} currentPath={currentPath} />
                      ))}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminPanel>
    </div>
  )
}
