'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme/ThemeProvider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ThemeChoice = 'system' | 'light' | 'dark'

const themeLabels: Record<ThemeChoice, string> = {
  system: '跟随系统',
  light: '浅色模式',
  dark: '深色模式',
}

function getIcon(theme: ThemeChoice) {
  if (theme === 'light') return 'i-lucide-sun-medium'
  if (theme === 'dark') return 'i-lucide-moon'
  return 'i-lucide-monitor-cog'
}

export default function AdminThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const selectedTheme = (theme || 'system') as ThemeChoice
  const label = `当前为${themeLabels[selectedTheme]}`

  if (!mounted) {
    return (
      <div
        className={cn('size-8 rounded-md border border-[var(--admin-border)] bg-background shadow-none', className)}
        aria-hidden="true"
      />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn('size-8 text-muted-foreground hover:text-foreground', className)}
          aria-label={label}
        >
          <span className={`${getIcon(selectedTheme)} text-base`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {(['system', 'light', 'dark'] as ThemeChoice[]).map(choice => (
          <DropdownMenuItem key={choice} onClick={() => setTheme(choice)} className="gap-2">
            <span className={`${getIcon(choice)} text-sm`} />
            <span>{themeLabels[choice]}</span>
            {selectedTheme === choice && <span className="i-lucide-check ml-auto text-sm" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
