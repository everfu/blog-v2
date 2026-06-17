import AdminCommentsStatusPage from '@/components/admin/AdminCommentsStatusPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    status?: string
    keyword?: string
    pagePath?: string
    createdFrom?: string
    createdTo?: string
    error?: string
  }>
}

export default async function AdminCommentsPage({ searchParams }: PageProps) {
  return <AdminCommentsStatusPage searchParams={await searchParams} />
}
