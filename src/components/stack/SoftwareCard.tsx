import Link from 'next/link'
import Image from 'next/image'
import type { SoftwareItem } from '@/data/software'

interface SoftwareCardProps {
  item: SoftwareItem
}

function ItemIcon({ icon, image, name }: Pick<SoftwareItem, 'icon' | 'image' | 'name'>) {
  if (icon) return <span className={`${icon} text-xl`} />
  if (image) return <Image src={image} alt={name} fill sizes="40px" className="object-cover rounded" />
  return <span className="i-lucide-package text-xl opacity-20 text-muted" />
}

export default function SoftwareCard({ item }: SoftwareCardProps) {
  const content = (
    <div className="card flex items-start gap-3 p-3 group">
      <div className="relative w-10 h-10 rounded flex items-center justify-center flex-shrink-0">
        <ItemIcon icon={item.icon} image={item.image} name={item.name} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium mb-0.5 group-hover:opacity-70 transition-opacity flex items-center gap-2">
          {item.name}
          {item.recommended && (
            <span className="text-xs px-1.5 py-0.5 text-red-500 font-medium">推荐</span>
          )}
        </h4>
        <p className="text-xs text-muted leading-relaxed">{item.description}</p>
      </div>
    </div>
  )

  return item.url ? (
    <Link href={item.url} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </Link>
  ) : content
}
