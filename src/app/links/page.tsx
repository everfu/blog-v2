import Image from 'next/image'
import { feedGroups } from '@/data/feeds'
import { SectionDivider } from '@/components/common'

export const metadata = {
  title: 'Links',
  description: '我的朋友们和帮助过我的人',
}

function getArchClass(arch: string) {
  const map: Record<string, string> = {
    Cloudflare: 'i-lucide-cloud',
    Hexo: 'i-lucide-hexagon',
    Nuxt: 'i-lucide-triangle',
    Vue: 'i-lucide-leaf',
    Vercel: 'i-lucide-circle-dot',
    '国内 CDN': 'i-lucide-radio-tower',
  }

  return map[arch] || 'i-lucide-tag'
}

export default function LinksPage() {
  return (
    <div className="space-y-0">
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">LINKS</span>
        </h2>
        <SectionDivider />

        <div className="mx-4 md:mx-8 my-8">
          <p className="text-sm text-muted leading-relaxed">
            我的朋友们和帮助过我的人。
          </p>
        </div>
      </section>

      <SectionDivider />

      <div className="mx-4 md:mx-8 my-8 space-y-10">
        {feedGroups.map((group, groupIndex) => (
          <section key={group.name}>
            <div className="mb-5 border-b border-border pb-3">
              <h3 className="text-lg font-semibold leading-tight">
                {String(groupIndex + 1).padStart(2, '0')} / {group.name}
              </h3>
              {group.desc && (
                <p className="mt-2 text-sm text-muted leading-relaxed">{group.desc}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {group.entries.map(link => (
                <a
                  key={`${group.name}-${link.link}`}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border border-border bg-card p-4 min-h-[142px] hover:border-primary transition-colors"
                >
                  <article className="flex h-full flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full border border-border bg-background">
                        <Image
                          src={link.icon || link.avatar}
                          alt={link.sitenick || link.author}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold leading-tight group-hover:opacity-70 transition-opacity">
                          {link.sitenick || link.author}
                        </h4>
                        <p className="mt-1 truncate text-xs text-muted">{link.author}</p>
                      </div>

                      <span className="i-lucide-arrow-up-right h-4 w-4 flex-shrink-0 text-muted group-hover:text-foreground transition-colors" />
                    </div>

                    {link.desc && (
                      <p className="line-clamp-2 text-sm text-muted leading-relaxed">{link.desc}</p>
                    )}

                    {link.archs?.length ? (
                      <div className="mt-auto flex flex-wrap gap-2">
                        {link.archs.map(arch => (
                          <span
                            key={arch}
                            title={arch}
                            className="inline-flex h-7 w-7 items-center justify-center border border-border bg-background text-muted"
                          >
                            <span className={`${getArchClass(arch)} text-sm`} />
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
