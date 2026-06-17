import { SectionDivider } from '@/components/common'
import AlbumClient from '@/components/album/AlbumClient'
import { getAlbumCategories } from '@/server/content/adapters/page'

export const revalidate = 300

export default async function AlbumPage() {
  const albumCategories = await getAlbumCategories()
  const collectionCount = albumCategories.length

  return (
    <div className="space-y-0">
      {/* 01 / ALBUM */}
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">ALBUM ({collectionCount} Collections)</span>
        </h2>
        <SectionDivider />
        
        <div className="mx-4 md:mx-8 my-8 space-y-5">
          <p className="text-sm text-muted leading-relaxed">
            记录生活中的美好瞬间，用镜头捕捉时光的痕迹。这里收藏着我的日常留影，分为日常、风景、人物、美食、旅行等不同主题。每一张照片都承载着独特的故事和回忆。
          </p>
        </div>
      </section>

      <SectionDivider />

      <AlbumClient categories={albumCategories} />
    </div>
  )
}
