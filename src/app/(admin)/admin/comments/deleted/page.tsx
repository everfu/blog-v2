import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    keyword?: string
    error?: string
  }>
}

export default async function AdminDeletedCommentsPage({ searchParams }: PageProps) {
  const params = new URLSearchParams(await searchParams)
  params.set('status', 'deleted')
  redirect(`/admin/comments?${params.toString()}`)
}
