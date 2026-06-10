import AdminNav from '@/components/admin/AdminNav'
import PostEditor from '@/components/admin/PostEditor'

export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  return (
    <section>
      <h2 className="section-title">
        01 / <span className="text-foreground">NEW POST</span>
      </h2>
      <AdminNav />
      <PostEditor />
    </section>
  )
}
