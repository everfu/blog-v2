import type { SoftwareCategory } from '@/types'
import SoftwareCard from './SoftwareCard'

interface SoftwareCatalogProps {
  categories: SoftwareCategory[]
}

export default function SoftwareCatalog({ categories }: SoftwareCatalogProps) {
  if (categories.length === 0) {
    return (
      <div className="border border-dashed border-border px-5 py-10 text-center">
        <span className="i-lucide-package-open mb-3 inline-block text-2xl text-muted" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-foreground">软件清单正在整理</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">发布软件分类和条目后，它们会显示在这里。</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {categories.map(category => (
        <section key={category.slug} aria-labelledby={`software-category-${category.slug}`}>
          <div className="mb-4 flex items-center justify-center">
            <div className="flex-1 border-t border-dashed border-border" />
            <h3 id={`software-category-${category.slug}`} className="px-4 text-base font-bold text-foreground">
              {category.name}
            </h3>
            <div className="flex-1 border-t border-dashed border-border" />
          </div>
          {category.description && (
            <p className="mx-auto mb-4 max-w-xl text-center text-xs leading-relaxed text-muted">
              {category.description}
            </p>
          )}

          {category.items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {category.items.map(item => (
                <SoftwareCard key={item.name} item={item} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border px-4 py-8 text-center text-xs text-muted">
              该分类暂未收录软件。
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
