import { getAllPosts, getMorePosts, getRecentPosts } from '@/server/posts/adapters/page'
import { PostCardLarge, PostsClient } from '@/components/posts'
import { SectionDivider } from '@/components/common'

export const revalidate = 300

export default async function PostsPage() {
  const [allPosts, recentPosts, allMorePosts] = await Promise.all([
    getAllPosts(),
    getRecentPosts(3),
    getMorePosts(),
  ])

  return (
    <div className="space-y-0">
      {/* Posts Header */}
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">POSTS ({allPosts.length} Posts)</span>
        </h2>
        <SectionDivider />
        
        <div className="mx-4 md:mx-8 my-8">
          <p className="text-sm text-muted leading-relaxed">
            欢迎来到文章页面，这里收录了我的所有博客文章。
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <>
          <section>
            <h2 className="section-title">
              02 / <span className="text-foreground">RECENT POSTS</span>
            </h2>
            <SectionDivider />
            
            <div className="space-y-6 mx-4 md:mx-8 my-8">
              {recentPosts.map((post) => (
                <PostCardLarge key={post.slug} post={post} />
              ))}
            </div>
          </section>

          <SectionDivider />
        </>
      )}

      {/* More Posts */}
      {allMorePosts.length > 0 && (
        <section>
          <h2 className="section-title">
            03 / <span className="text-foreground">MORE POSTS</span>
          </h2>
          <SectionDivider />
          
          <PostsClient posts={allMorePosts} />
        </section>
      )}

      {/* Empty State */}
      {allPosts.length === 0 && (
        <section>
          <h2 className="section-title">
            01 / <span className="text-foreground">POSTS (0 Posts)</span>
          </h2>
          <SectionDivider />
          
          <div className="mx-4 md:mx-8 my-8 text-center py-20">
            <p className="text-muted text-lg">No posts yet. Stay tuned!</p>
          </div>
        </section>
      )}
    </div>
  )
}
