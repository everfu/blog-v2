import Image from 'next/image'
import { DEFAULT_FRIEND_AVATAR } from '@/features/feeds/utils'
import { SectionDivider } from '@/components/common'
import { Comment } from '@/components/ui'
import FriendApplicationForm from '@/components/friends/FriendApplicationForm'
import { getFeedGroups, getFriendApplicationSettings } from '@/server/content/adapters/page'
import type { FeedEntry, FeedGroup } from '@/types/feed'

export const metadata = {
  title: 'Links',
  description: '我的朋友们和帮助过我的人',
}

export const revalidate = 300

function getArchClass(arch: string) {
  const map: Record<string, string> = {
    Cloudflare: 'i-devicon-cloudflare',
    Hexo: 'i-logos-hexo',
    Nuxt: 'i-material-icon-theme-nuxt',
    Vue: 'i-material-icon-theme-vue',
    Astro: 'i-catppuccin-astro',
    Vercel: 'i-ri-vercel-line',
    '国内 CDN': 'i-twemoji-flag-china',
    Server: 'i-logos-nginx',
  }

  return map[arch] || 'i-lucide-tag'
}

function formatJoinDate(date: string) {
  return date.replace(/-/g, '.')
}

function StatPill({ value, label }: { value: string | number, label: string }) {
  return (
    <div className="border border-border bg-card px-3 py-2">
      <div className="font-mono text-base font-semibold leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  )
}

function GroupHeader({ group, index }: { group: FeedGroup, index: number }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="font-mono text-xs uppercase tracking-wide text-muted">
          {String(index + 1).padStart(2, '0')} / collection
        </div>
        <h3 className="mt-1 text-xl font-semibold leading-tight">{group.name}</h3>
        {group.desc && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{group.desc}</p>
        )}
      </div>

      <div className="inline-flex w-fit items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs text-muted">
        <span className="i-lucide-users h-3.5 w-3.5" />
        <span>{group.entries.length} links</span>
      </div>
    </div>
  )
}

function LinkCard({ link }: { link: FeedEntry }) {
  const title = link.sitenick || link.author
  const avatar = link.avatar || link.icon || DEFAULT_FRIEND_AVATAR
  const icon = link.icon || avatar
  const badgeTitle = link.feedMuted ? '免打扰' : ''

  return (
    <a
      href={link.link}
      target="_blank"
      rel="noopener noreferrer"
      className="card group/link relative block min-h-[132px] overflow-hidden p-4 opacity-100 outline-none focus-visible:border-primary motion-reduce:transition-none"
    >
      <article className="flex h-full flex-col">
        <div className="flex items-start gap-3">
          <div className="relative h-11 w-11 flex-shrink-0">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border bg-background">
              <Image
                src={avatar}
                alt={title}
                fill
                sizes="44px"
                className="object-cover transition-transform duration-500 group-hover/link:scale-105 group-focus-visible/link:scale-105 motion-reduce:transition-none"
              />
            </div>

            {link.feedMuted ? (
              <div
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-muted"
                title={badgeTitle}
                aria-label={badgeTitle}
              >
                <span className="i-lucide-bell-off h-3 w-3" />
              </div>
            ) : (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full border border-border bg-background p-0.5">
                <Image
                  src={icon}
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover p-0.5"
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h4 className="truncate text-sm font-semibold leading-tight transition-opacity group-hover/link:opacity-75 group-focus-visible/link:opacity-75">
              {title}
            </h4>
            <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wide text-muted">
              {link.author}
            </p>
          </div>

          <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center border border-border bg-background text-muted transition-colors duration-300 group-hover/link:border-primary group-hover/link:text-foreground group-focus-visible/link:border-primary group-focus-visible/link:text-foreground">
            <span className="i-lucide-arrow-up-right h-4 w-4" />
          </span>
        </div>

        {link.desc && (
          <p className="mt-3 line-clamp-1 text-sm leading-relaxed text-muted">
            {link.desc}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <span className="i-lucide-calendar h-3.5 w-3.5" />
            {formatJoinDate(link.date)}
          </span>
          {link.archs?.length ? (
            <div className="flex flex-wrap gap-2">
              {link.archs.map(arch => (
                <span
                  key={arch}
                  title={arch}
                  className="inline-flex h-6 w-6 items-center justify-center border border-border bg-background text-muted transition-colors group-hover/link:border-primary group-hover/link:text-foreground group-focus-visible/link:border-primary group-focus-visible/link:text-foreground"
                >
                  <span className={`${getArchClass(arch)} text-xs`} />
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </a>
  )
}

export default async function LinksPage() {
  const [feedGroups, applicationSettings] = await Promise.all([
    getFeedGroups(),
    getFriendApplicationSettings(),
  ])
  const totalLinks = feedGroups.reduce((count, group) => count + group.entries.length, 0)

  return (
    <div className="space-y-5">
      <section>
        <h2 className="section-title">
          01 / <span className="text-foreground">LINKS</span>
        </h2>
        <SectionDivider />

        <div className="mx-4 my-8 md:mx-8">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <p className="max-w-xl text-sm leading-relaxed text-muted">
                我的朋友们和帮助过我的人。每一张名片都通向一个认真生活、写作或创造的人。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <StatPill value={totalLinks} label="friends" />
              <StatPill value={feedGroups.length} label="groups" />
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <div className="mx-4 space-y-5 pb-5 md:mx-8">
        {feedGroups.map((group, groupIndex) => (
          <section key={group.name}>
            <GroupHeader group={group} index={groupIndex} />

            <div className="grid gap-4 sm:grid-cols-2">
              {group.entries.map(link => (
                <LinkCard
                  key={`${group.name}-${link.link}`}
                  link={link}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <SectionDivider />

      {applicationSettings.enabled && (
        <>
          <FriendApplicationForm />
          <SectionDivider />
        </>
      )}

      <Comment path="/links" />
    </div>
  )
}
