import FriendsClient from '@/components/friends/FriendsClient'
import { SectionDivider } from '@/components/common'

export const metadata = {
  title: 'Friends',
  description: '朋友们最近写下的内容',
}

export default function FriendsPage() {
  return (
    <div className="space-y-0">
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">FRIENDS</span>
        </h2>
        <SectionDivider />

        <div className="mx-4 md:mx-8 my-8">
          <p className="text-sm text-muted leading-relaxed">
            朋友们最近写下的内容，按发布时间汇聚在这里。
          </p>
        </div>
      </section>

      <SectionDivider />

      <FriendsClient />
    </div>
  )
}
