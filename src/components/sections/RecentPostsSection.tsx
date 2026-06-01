import { getRecentPosts } from '@/features/posts'
import { PostCard } from '@/components/posts'
import { SectionDivider } from '@/components/common'

export default function RecentPostsSection() {
  const posts = getRecentPosts()

  return (
    <section>
      <h2 className="section-title">
        02 / <span className="text-foreground">RECENT POSTS</span>
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
