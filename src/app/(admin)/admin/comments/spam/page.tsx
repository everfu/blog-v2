import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    keyword?: string
    error?: string
  }>
}

export default async function AdminSpamCommentsPage({ searchParams }: PageProps) {
  const params = new URLSearchParams(await searchParams)
  params.set('status', 'spam')
  redirect(`/admin/comments?${params.toString()}`)
}
