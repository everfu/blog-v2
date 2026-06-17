import { WatchedCard } from '@/components/ui'
import { SectionDivider } from '@/components/common'
import { getWatchedItems } from '@/server/content/adapters/page'

export default async function RecentlyWatchedSection({
  title = 'Recently Watched',
  limit = 4,
  indexLabel = '03',
}: {
  title?: string
  limit?: number
  indexLabel?: string
}) {
  const watchedItems = await getWatchedItems(limit)

  return (
    <section>
      <h2 className="section-title">
        {indexLabel} / <span className="text-foreground">{title.toUpperCase()}</span>
      </h2>
      <SectionDivider />
      
      {watchedItems.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mx-4 md:mx-8 my-8">
          {watchedItems.map(item => (
            <WatchedCard key={`${item.title}-${item.date}`} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
