import { SectionDivider } from '@/components/common'
import HeroSection from '@/components/sections/HeroSection'
import RecentPostsSection from '@/components/sections/RecentPostsSection'
import RecentlyWatchedSection from '@/components/sections/RecentlyWatchedSection'
import { getHomeSections } from '@/server/content/adapters/page'
import { mergeDefaultHomeSections, parseListMetadata } from '@/server/home/adapters/page'

export const revalidate = 300

export default async function Home() {
  const configuredSections = mergeDefaultHomeSections(await getHomeSections(), false)

  return (
    <div className="space-y-0">
      {configuredSections.map((section, index) => {
        const divider = index < configuredSections.length - 1 ? <SectionDivider /> : null
        const indexLabel = String(index + 1).padStart(2, '0')

        if (section.key === 'hero') {
          return (
            <div key={section.key}>
              <HeroSection title={section.title} subtitle={section.subtitle} metadata={section.metadata} indexLabel={indexLabel} />
              {divider}
            </div>
          )
        }

        if (section.key === 'recent_posts') {
          return (
            <div key={section.key}>
              <RecentPostsSection title={section.title} limit={parseListMetadata(section.metadata).limit} indexLabel={indexLabel} />
              {divider}
            </div>
          )
        }

        return (
          <div key={section.key}>
            <RecentlyWatchedSection title={section.title} limit={parseListMetadata(section.metadata).limit} indexLabel={indexLabel} />
            {divider}
          </div>
        )
      })}
    </div>
  )
}
