import { SectionDivider } from '@/components/common'
import HeroSection from '@/components/sections/HeroSection'
import RecentPostsSection from '@/components/sections/RecentPostsSection'
import RecentlyWatchedSection from '@/components/sections/RecentlyWatchedSection'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <SectionDivider />
      
      <RecentPostsSection />
      <SectionDivider />
      
      <RecentlyWatchedSection />
    </div>
  )
}
