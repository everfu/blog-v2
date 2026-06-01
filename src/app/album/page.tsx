import { SectionDivider } from '@/components/common'
import AlbumClient from '@/components/album/AlbumClient'
import { albumCategories } from '@/data/album'

export default function AlbumPage() {
  return (
    <div className="space-y-0">
      {/* 01 / ALBUM */}
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">ALBUM</span>
        </h2>
        <SectionDivider />
        
        <div className="mx-4 md:mx-8 my-8">
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
