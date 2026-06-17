import { getRecentPosts } from '@/server/posts/adapters/page'
import { PostCard } from '@/components/posts'
import { SectionDivider } from '@/components/common'

export default async function RecentPostsSection({
  title = 'Recent Posts',
  limit,
  indexLabel = '02',
}: {
  title?: string
  limit?: number
  indexLabel?: string
}) {
  const posts = await getRecentPosts(limit)

  return (
    <section>
      <h2 className="section-title">
        {indexLabel} / <span className="text-foreground">{title.toUpperCase()}</span>
      </h2>
      <SectionDivider />
      
      <div className="grid md:grid-cols-2 gap-4 mx-4 md:mx-8 my-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
