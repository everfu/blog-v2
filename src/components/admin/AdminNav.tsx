'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ActivityIcon,
  BoxesIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FilmIcon,
  FingerprintIcon,
  ImageIcon,
  ImagesIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  SettingsIcon,
  NetworkIcon,
  PanelsTopLeftIcon,
  UsersRoundIcon,
} from 'lucide-react'
import AdminThemeToggle from './AdminThemeToggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const groups = [
  {
    label: '工作台',
    items: [
      { href: '/admin', label: '工作台', icon: LayoutDashboardIcon },
    ],
  },
  {
    label: '内容运营',
    items: [
      { href: '/admin/posts', label: '文章管理', icon: FileTextIcon },
      { href: '/admin/home', label: '首页编排', icon: PanelsTopLeftIcon },
      { href: '/admin/watched', label: '电影推荐', icon: FilmIcon },
    ],
  },
  {
    label: '媒体资产',
    items: [
      { href: '/admin/media', label: '媒体资源库', icon: ImageIcon },
      { href: '/admin/album', label: '相册管理', icon: ImagesIcon },
      { href: '/admin/stack', label: '硬件与软件', icon: BoxesIcon },
      { href: '/admin/friends', label: '友链与朋友圈', icon: NetworkIcon },
    ],
  },
  {
    label: '互动运营',
    items: [
      { href: '/admin/comments', label: '评论管理', icon: MessageSquareIcon },
      { href: '/admin/comment-settings', label: '评论设置', icon: SettingsIcon },
    ],
  },
  {
    label: '系统管理',
    items: [
      { href: '/admin/settings', label: '账号安全', icon: FingerprintIcon },
      { href: '/admin/users', label: '成员权限', icon: UsersRoundIcon },
      { href: '/admin/audit', label: '操作日志', icon: ActivityIcon },
    ],
  },
]

function NavItem({
  item,
  isActive,
  mobile,
}: {
  item: { href: string, label: string, icon: typeof LayoutDashboardIcon }
  isActive: boolean
  mobile?: boolean
}) {
  const Icon = item.icon
  const link = (
    <Button
      asChild
      variant="ghost"
      size={mobile ? 'lg' : 'default'}
      data-active={isActive}
      className={cn(
        'relative w-full justify-start gap-2.5 rounded-lg px-2.5 text-left font-medium text-muted hover:bg-[var(--admin-accent-soft)] hover:text-foreground',
        'data-[active=true]:bg-background data-[active=true]:text-foreground',
        'data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1/2 data-[active=true]:before:h-4 data-[active=true]:before:w-0.75 data-[active=true]:before:-translate-y-1/2 data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary',
        mobile ? 'h-10 text-sm' : 'h-8 text-[13px]'
      )}
    >
      <Link href={item.href}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    </Button>
  )

  return mobile ? (
    <SheetClose asChild>
      {link}
    </SheetClose>
  ) : link
}

function NavGroups({ pathname, mobile = false }: { pathname: string, mobile?: boolean }) {
  return (
    <nav className={cn('flex flex-col', mobile ? 'gap-4 px-4 py-3' : 'gap-3 px-4 py-3')}>
      {groups.map(group => (
        <div key={group.label} className="grid gap-1">
          <div className="px-2.5 text-[10px] font-medium uppercase tracking-wide text-muted">{group.label}</div>
          {group.items.map(item => {
            const isActive = item.href === '/admin'
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return <NavItem key={item.href} item={item} isActive={isActive} mobile={mobile} />
          })}
        </div>
      ))}
    </nav>
  )
}

function AdminUtilities() {
  const utilityButtonClass = 'h-9 w-full rounded-md border border-transparent bg-transparent text-muted shadow-none transition-colors hover:border-[var(--admin-border)] hover:bg-background hover:text-foreground'

  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]/80 p-1">
      <Button variant="ghost" size="icon" asChild className={utilityButtonClass}>
        <Link href="/" target="_blank" rel="noreferrer" aria-label="预览站点">
          <ExternalLinkIcon className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" asChild className={utilityButtonClass}>
        <Link href="/logout" aria-label="退出登录">
          <LogOutIcon className="h-4 w-4" />
        </Link>
      </Button>
      <AdminThemeToggle className={cn(
        utilityButtonClass,
        'data-[state=open]:border-[var(--admin-border-strong)] data-[state=open]:bg-background data-[state=open]:text-foreground'
      )}
      />
    </div>
  )
}

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 px-4 backdrop-blur lg:hidden">
        <div className="text-sm font-semibold text-foreground">后台</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon-lg" aria-label="打开后台导航">
              <MenuIcon className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[288px] gap-0 p-0" showCloseButton>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavGroups pathname={pathname} mobile />
            </div>
            <Separator />
            <div className="px-4 pb-4 pt-3">
              <AdminUtilities />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <aside className="hidden border-r border-[var(--admin-border)] bg-[var(--admin-surface)]/95 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[256px] lg:flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <NavGroups pathname={pathname} />
        </div>
        <Separator />
        <div className="px-4 pb-4 pt-3">
          <AdminUtilities />
        </div>
      </aside>
    </>
  )
}
